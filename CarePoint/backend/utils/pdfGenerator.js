const PDFDocument = require("pdfkit");
const path = require("path");

// Generate Prescription PDF
exports.generatePrescriptionPDF = (prescription, doctor, patient) => {
  const doc = new PDFDocument({
    bufferPages: true,
    size: "A4",
    margin: 50,
  });

  // Header
  doc.fontSize(24).font("Helvetica-Bold").text("Medical Prescription", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(10).font("Helvetica").text("─".repeat(70), { align: "center" });
  doc.moveDown(1);

  // Doctor Info
  doc.fontSize(12).font("Helvetica-Bold").text("Dr. " + doctor.user.name);
  doc.fontSize(10).font("Helvetica").text("Specialization: " + doctor.specialty);
  doc.moveDown(1);

  // Patient Info
  doc.fontSize(11).font("Helvetica-Bold").text("Patient Information");
  doc.fontSize(10).font("Helvetica")
    .text("Name: " + patient.name)
    .text("Email: " + patient.email)
    .text("Age: " + patient.age || "N/A");
  doc.moveDown(1);

  // Prescription Date
  doc.fontSize(11).font("Helvetica-Bold").text("Prescription Details");
  doc.fontSize(10).font("Helvetica");
  doc.text("Issued: " + new Date(prescription.createdAt || prescription.issuedDate).toLocaleDateString("en-US", { 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  }));
  if (prescription.expiryDate) {
    doc.text("Valid Until: " + new Date(prescription.expiryDate).toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    }));
  }
  doc.moveDown(1);

  // Medications
  doc.fontSize(12).font("Helvetica-Bold").text("Medications / Prescriptions");
  doc.fontSize(10).text("─".repeat(70));
  doc.moveDown(0.5);

  if (prescription.medications && prescription.medications.length > 0) {
    prescription.medications.forEach((med, index) => {
      // Medicine name - prominent
      doc.font("Helvetica-Bold").fontSize(11).text(`${index + 1}. ${med.name}`);
      
      // Medicine details in organized table format
      doc.font("Helvetica").fontSize(9);
      
      const dosageInfo = [
        { label: "Dosage:", value: med.dosage },
        { label: "Frequency:", value: med.frequency },
        { label: "Duration:", value: med.duration },
        ...(med.quantity ? [{ label: "Quantity:", value: `${med.quantity} units` }] : [])
      ];
      
      dosageInfo.forEach(item => {
        doc.text(`   ${item.label} ${item.value}`);
      });
      
      if (med.instructions) {
        doc.font("Helvetica-Italic").text(`   Instructions: ${med.instructions}`);
      }
      
      doc.moveDown(0.5);
    });
  }
  doc.moveDown(1);

  // Diagnosis
  if (prescription.diagnosis) {
    doc.fontSize(11).font("Helvetica-Bold").text("Diagnosis/Indication");
    doc.fontSize(10).font("Helvetica").text(prescription.diagnosis);
    doc.moveDown(1);
  }

  // Additional Instructions
  if (prescription.notes) {
    doc.fontSize(11).font("Helvetica-Bold").text("General Instructions");
    doc.fontSize(10).font("Helvetica").text(prescription.notes, { align: "left" });
    doc.moveDown(1);
  }

  // Footer
  doc.moveDown(2);
  doc.fontSize(8).font("Helvetica").text("─".repeat(70), { align: "center" });
  doc.text("This is an electronically generated prescription.", { align: "center" });
  doc.text("Please follow all instructions carefully and consult your doctor if any issues arise.", {
    align: "center",
  });
  doc.text(
    "© CarePoint Healthcare. This document is confidential and for authorized use only.",
    { align: "center" }
  );

  return doc;
};

// Generate Medical Record PDF
exports.generateMedicalRecordPDF = (medicalRecord, doctor, patient) => {
  const doc = new PDFDocument({
    bufferPages: true,
    size: "A4",
    margin: 50,
  });

  // Header
  doc.fontSize(24).font("Helvetica-Bold").text("Medical Record", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(10).font("Helvetica").text("─".repeat(70), { align: "center" });
  doc.moveDown(1);

  // Doctor Info
  doc.fontSize(12).font("Helvetica-Bold").text("Attending Physician");
  doc.fontSize(10).font("Helvetica").text("Dr. " + doctor.user.name);
  doc.text("Specialization: " + doctor.specialty);
  doc.moveDown(1);

  // Patient Info
  doc.fontSize(11).font("Helvetica-Bold").text("Patient Information");
  doc.fontSize(10).font("Helvetica")
    .text("Name: " + patient.name)
    .text("Email: " + patient.email)
    .text("Age: " + patient.age || "N/A");
  doc.moveDown(1);

  // Record Date
  doc.fontSize(11).font("Helvetica-Bold").text("Record Date");
  doc.fontSize(10).font("Helvetica").text(new Date(medicalRecord.createdAt).toLocaleDateString());
  doc.moveDown(1);

  // Symptoms
  if (medicalRecord.symptoms) {
    doc.fontSize(11).font("Helvetica-Bold").text("Symptoms");
    doc.fontSize(10).font("Helvetica").text(medicalRecord.symptoms);
    doc.moveDown(1);
  }

  // Diagnosis
  if (medicalRecord.diagnosis) {
    doc.fontSize(11).font("Helvetica-Bold").text("Diagnosis");
    doc.fontSize(10).font("Helvetica").text(medicalRecord.diagnosis);
    doc.moveDown(1);
  }

  // Treatment Plan
  if (medicalRecord.treatmentPlan) {
    doc.fontSize(11).font("Helvetica-Bold").text("Treatment Plan");
    doc.fontSize(10).font("Helvetica").text(medicalRecord.treatmentPlan);
    doc.moveDown(1);
  }

  // Vitals
  if (medicalRecord.vitals) {
    doc.fontSize(11).font("Helvetica-Bold").text("Vital Signs");
    doc.fontSize(10).font("Helvetica").text("─".repeat(70));
    doc.moveDown(0.3);

    const vitals = medicalRecord.vitals;
    if (vitals.bloodPressure)
      doc.text(`Blood Pressure: ${vitals.bloodPressure}`);
    if (vitals.temperature)
      doc.text(`Temperature: ${vitals.temperature}°C`);
    if (vitals.heartRate)
      doc.text(`Heart Rate: ${vitals.heartRate} bpm`);
    if (vitals.respiratoryRate)
      doc.text(`Respiratory Rate: ${vitals.respiratoryRate} breaths/min`);
    if (vitals.weight)
      doc.text(`Weight: ${vitals.weight} kg`);
    if (vitals.height)
      doc.text(`Height: ${vitals.height} cm`);

    doc.moveDown(1);
  }

  // Notes
  if (medicalRecord.notes) {
    doc.fontSize(11).font("Helvetica-Bold").text("Additional Notes");
    doc.fontSize(10).font("Helvetica").text(medicalRecord.notes);
    doc.moveDown(1);
  }

  // Footer
  doc.moveDown(2);
  doc.fontSize(8).font("Helvetica").text("─".repeat(70), { align: "center" });
  doc.text("This is an electronically generated medical record.", { align: "center" });
  doc.text("Please keep this record safe for future reference and consultations.", {
    align: "center",
  });
  doc.text(
    "© CarePoint Healthcare. This document is confidential and for authorized use only.",
    { align: "center" }
  );

  return doc;
};
