// server/controllers/userController.js
import Hospital from "../models/hospitalModel.js";

// Helper function to calculate distance using Haversine formula
function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

// Get nearby hospitals with their services and waiting counts
export const getNearbyHospitals = async (req, res) => {
  const { lat, lon, radius = 10 } = req.query; // Default radius: 10km
  const userLat = parseFloat(lat);
  const userLon = parseFloat(lon);
  const searchRadius = parseFloat(radius);

  if (isNaN(userLat) || isNaN(userLon) || isNaN(searchRadius)) {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid coordinates or radius provided" 
    });
  }

  try {
    const hospitals = await Hospital.find({});
    
    // Filter hospitals within the specified radius and format the response
    const nearbyHospitals = hospitals
      .filter((hospital) => {
        const hospitalLat = hospital.location.coordinates[1];
        const hospitalLon = hospital.location.coordinates[0];
        const distance = haversineDistance(userLat, userLon, hospitalLat, hospitalLon);
        return distance <= searchRadius;
      })
      .map((hospital) => {
        const distance = parseFloat(haversineDistance(
          userLat, 
          userLon, 
          hospital.location.coordinates[1], 
          hospital.location.coordinates[0]
        ).toFixed(2));

        // Format services with their waiting counts
        const services = hospital.services.map(service => ({
          serviceId: service._id,
          serviceName: service.name,
          waitingPatients: service.waitingPatients,
          estimatedWaitTime: service.waitingPatients * 15 // Approximate wait time in minutes
        }));

        return {
          hospitalId: hospital._id,
          hospitalName: hospital.name,
          distance,
          location: hospital.location,
          services
        };
      });

    res.status(200).json({ 
      success: true, 
      data: nearbyHospitals 
    });
  } catch (error) {
    console.error("Error fetching nearby hospitals:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch nearby hospitals" 
    });
  }
};

// Get details of a specific hospital with current waiting patient counts
export const getHospitalDetails = async (req, res) => {
  const { hospitalId } = req.params;

  try {
    const hospital = await Hospital.findById(hospitalId);
    
    if (!hospital) {
      return res.status(404).json({ 
        success: false, 
        message: "Hospital not found" 
      });
    }

    // Format the response with services and waiting counts
    const formattedHospital = {
      hospitalId: hospital._id,
      hospitalName: hospital.name,
      location: hospital.location,
      services: hospital.services.map(service => ({
        serviceId: service._id,
        serviceName: service.name,
        waitingPatients: service.waitingPatients,
        estimatedWaitTime: service.waitingPatients * 15 // Approximate wait time in minutes
      }))
    };

    res.status(200).json({ 
      success: true, 
      data: formattedHospital 
    });
  } catch (error) {
    console.error("Error fetching hospital details:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch hospital details" 
    });
  }
};

// Update waiting count for a service at a hospital
export const updateWaitingCount = async (req, res) => {
  const { hospitalId, serviceId } = req.body;

  if (!hospitalId || !serviceId) {
    return res.status(400).json({ 
      success: false, 
      message: "Hospital ID and service ID are required" 
    });
  }

  try {
    const hospital = await Hospital.findById(hospitalId);
    
    if (!hospital) {
      return res.status(404).json({ 
        success: false, 
        message: "Hospital not found" 
      });
    }
    
    const service = hospital.services.id(serviceId);
    
    if (!service) {
      return res.status(404).json({ 
        success: false, 
        message: "Service not found" 
      });
    }
    
    // Increment waiting patients count
    service.waitingPatients += 1;
    
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
        waitingPatients: service.waitingPatients,
        estimatedWaitTime: service.waitingPatients * 15, // Approximate wait time in minutes
        message: "Waiting count updated successfully" 
      } 
    });
  } catch (error) {
    console.error("Error updating waiting count:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update waiting count" 
    });
  }
};
