import qrcode

# The Expo LAN URL for the physical device running Expo Go
expo_url = "exp://192.168.18.143:8082"

# Generate the QR Code
qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_L,
    box_size=10,
    border=4,
)
qr.add_data(expo_url)
qr.make(fit=True)

# Create an image from the QR Code
img = qr.make_image(fill_color="black", back_color="white")

# Save it to the workspace root
img.save("expo_qr.png")
print("Successfully generated expo_qr.png in the workspace root!")
