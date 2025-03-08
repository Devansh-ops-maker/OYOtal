import Hospital from '../models/Hospital.js';

// Get all hospitals with services
export const getAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    res.status(200).json({ success: true, data: hospitals });
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch hospitals' });
  }
};

// Update waiting patients count for a service
export const updateWaitingPatients = async (req, res) => {
  const { hospitalId, serviceId, action } = req.body;

  if (!hospitalId || !serviceId || !action) {
    return res.status(400).json({
      success: false,
      message: 'Hospital ID, service ID, and action (increment/decrement) are required'
    });
  }

  try {
    const hospital = await Hospital.findById(hospitalId);

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    const service = hospital.services.id(serviceId);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Update waiting patients count
    if (action === 'increment') {
      service.waitingPatients += 1;
    } else if (action === 'decrement') {
      if (service.waitingPatients > 0) {
        service.waitingPatients -= 1;
      }
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    await hospital.save();

    // Emit WebSocket event with updated data
    req.io.emit('patientCountUpdated', {
      hospitalId,
      serviceId,
      waitingPatients: service.waitingPatients
    });

    res.status(200).json({
      success: true,
      data: {
        hospitalId,
        serviceId,
        waitingPatients: service.waitingPatients
      }
    });
  } catch (error) {
    console.error('Error updating waiting patients:', error);
    res.status(500).json({ success: false, message: 'Failed to update waiting patients' });
  }
};
