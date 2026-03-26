import cv2
import numpy as np

def estimate_dimensions_from_image(image_bytes: bytes, calibration_factor: float = 0.01) -> dict:
    """
    CV Model to detect a dark fabric polygon on a contrasting light table.
    Returns the estimated proportional dimensions via a bounding box.
    """
    try:
        np_arr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise ValueError("Could not decode image.")
            
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Blur to reduce visual noise from the factory floor
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Otsu's adaptive thresholding to find the dark fabric blob
        _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        
        # Find continuous border contours
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return {"success": False, "message": "No clear fabric boundary detected."}
            
        # Find the largest shape (which should be the fabric roll)
        largest_contour = max(contours, key=cv2.contourArea)
        
        # Draw a mathematical bounding box around it
        x, y, w, h = cv2.boundingRect(largest_contour)
        
        # Convert raw pixels to mock physical meters (using standard calibration constant)
        # Note: In a real factory, camera height is fixed so this ratio is a fixed constant.
        est_length = max(w, h) * calibration_factor
        est_width = min(w, h) * calibration_factor
        
        # Cap limits for prototype usability
        if est_length < 0.5: est_length = est_length * 10
        if est_width < 0.5: est_width = est_width * 10
        
        return {
            "success": True,
            "estimated_length": round(est_length, 2),
            "estimated_width": round(est_width, 2)
        }
    except Exception as e:
        print(f"Error processing image: {e}")
        return {"success": False, "message": str(e)}
