import QRCode from 'qrcode';

async function test() {
  try {
    const qrData = JSON.stringify({
      flowfi_id: 'test-id-1234',
      email: 'test@example.com',
      phone: '1234567890'
    });
    console.log("Generating QR for:", qrData);
    const qrDataURL = await QRCode.toDataURL(qrData);
    console.log("SUCCESS! Length of data URL:", qrDataURL.length);
  } catch (error) {
    console.error("FAILED to generate QR:", error);
  }
}

test();
