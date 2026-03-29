import os
from PIL import Image
from rembg import remove

def process_images(directory):
    for filename in os.listdir(directory):
        if filename.endswith(".png") or filename.endswith(".jpg"):
            input_path = os.path.join(directory, filename)
            # Create a backup just in case
            backup_path = os.path.join(directory, "backup_" + filename)
            if not os.path.exists(backup_path):
                import shutil
                shutil.copy(input_path, backup_path)
            
            print(f"Processing {filename}...")
            try:
                input_image = Image.open(input_path)
                output_image = remove(input_image)
                output_image.save(input_path) # Overwrite original with transparent
                print(f"Successfully removed background from {filename}")
            except Exception as e:
                print(f"Failed to process {filename}: {e}")

if __name__ == "__main__":
    target_dir = r"c:\Users\dines\Desktop\epics\Epics-\frontend\public\garments"
    process_images(target_dir)
