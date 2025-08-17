import { Server } from 'socket.io';
import { db } from './db';

interface AlertData {
  type: 'bin_full' | 'battery_low' | 'bin_maintenance';
  binId: string;
  binCode: string;
  binName: string;
  location: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: Date;
}

export const setupSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Join room for real-time alerts
    socket.join('alerts');
    
    // Handle request for current alerts
    socket.on('get_current_alerts', async () => {
      try {
        // Buscar lixeiras que precisam de alertas
        const fullBins = await db.trashBin.findMany({
          where: {
            status: 'ACTIVE',
            currentLevel: {
              gte: 80 // 80% da capacidade
            }
          }
        });

        const lowBatteryBins = await db.trashBin.findMany({
          where: {
            status: 'ACTIVE',
            batteryLevel: {
              lt: 20 // Menos de 20% de bateria
            }
          }
        });

        const maintenanceBins = await db.trashBin.findMany({
          where: {
            status: 'MAINTENANCE'
          }
        });

        const alerts: AlertData[] = [];

        // Gerar alertas para lixeiras cheias
        fullBins.forEach(bin => {
          alerts.push({
            type: 'bin_full',
            binId: bin.id,
            binCode: bin.code,
            binName: bin.name,
            location: bin.location,
            severity: bin.currentLevel >= 95 ? 'high' : 'medium',
            message: `Lixeira ${bin.name} está com ${bin.currentLevel}% de capacidade`,
            timestamp: new Date()
          });
        });

        // Gerar alertas para bateria baixa
        lowBatteryBins.forEach(bin => {
          alerts.push({
            type: 'battery_low',
            binId: bin.id,
            binCode: bin.code,
            binName: bin.name,
            location: bin.location,
            severity: bin.batteryLevel < 10 ? 'high' : 'medium',
            message: `Lixeira ${bin.name} está com ${bin.batteryLevel}% de bateria`,
            timestamp: new Date()
          });
        });

        // Gerar alertas para lixeiras em manutenção
        maintenanceBins.forEach(bin => {
          alerts.push({
            type: 'bin_maintenance',
            binId: bin.id,
            binCode: bin.code,
            binName: bin.name,
            location: bin.location,
            severity: 'low',
            message: `Lixeira ${bin.name} está em manutenção`,
            timestamp: new Date()
          });
        });

        socket.emit('current_alerts', alerts);
      } catch (error) {
        console.error('Erro ao buscar alertas:', error);
        socket.emit('error', { message: 'Erro ao buscar alertas' });
      }
    });

    // Handle bin status updates
    socket.on('update_bin_status', async (data: { binId: string; currentLevel?: number; batteryLevel?: number; status?: string }) => {
      try {
        const updatedBin = await db.trashBin.update({
          where: { id: data.binId },
          data: {
            ...(data.currentLevel !== undefined && { currentLevel: data.currentLevel }),
            ...(data.batteryLevel !== undefined && { batteryLevel: data.batteryLevel }),
            ...(data.status !== undefined && { status: data.status as any })
          }
        });

        // Verificar se precisa gerar alerta
        let alert: AlertData | null = null;

        if (data.currentLevel !== undefined && data.currentLevel >= 80) {
          alert = {
            type: 'bin_full',
            binId: updatedBin.id,
            binCode: updatedBin.code,
            binName: updatedBin.name,
            location: updatedBin.location,
            severity: data.currentLevel >= 95 ? 'high' : 'medium',
            message: `Lixeira ${updatedBin.name} está com ${data.currentLevel}% de capacidade`,
            timestamp: new Date()
          };
        }

        if (data.batteryLevel !== undefined && data.batteryLevel < 20) {
          alert = {
            type: 'battery_low',
            binId: updatedBin.id,
            binCode: updatedBin.code,
            binName: updatedBin.name,
            location: updatedBin.location,
            severity: data.batteryLevel < 10 ? 'high' : 'medium',
            message: `Lixeira ${updatedBin.name} está com ${data.batteryLevel}% de bateria`,
            timestamp: new Date()
          };
        }

        if (data.status !== undefined && data.status === 'MAINTENANCE') {
          alert = {
            type: 'bin_maintenance',
            binId: updatedBin.id,
            binCode: updatedBin.code,
            binName: updatedBin.name,
            location: updatedBin.location,
            severity: 'low',
            message: `Lixeira ${updatedBin.name} está em manutenção`,
            timestamp: new Date()
          };
        }

        if (alert) {
          // Broadcast para todos os clientes na sala de alertas
          io.to('alerts').emit('new_alert', alert);
        }

        socket.emit('bin_updated', updatedBin);
      } catch (error) {
        console.error('Erro ao atualizar lixeira:', error);
        socket.emit('error', { message: 'Erro ao atualizar lixeira' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      socket.leave('alerts');
    });

    // Send welcome message
    socket.emit('message', {
      text: 'Conectado ao sistema de alertas de lixeiras!',
      senderId: 'system',
      timestamp: new Date().toISOString(),
    });
  });
};