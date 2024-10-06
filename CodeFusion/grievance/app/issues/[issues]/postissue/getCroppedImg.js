export default function getCroppedImg(imageSrc, pixelCrop) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = imageSrc;
        image.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const { width, height } = pixelCrop;

            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(
                image,
                pixelCrop.x,
                pixelCrop.y,
                pixelCrop.width,
                pixelCrop.height,
                0,
                0,
                width,
                height
            );

            // Directly resolve with the data URL
            const dataUrl = canvas.toDataURL('image/jpeg');
            resolve(dataUrl);
        };
        image.onerror = reject;
    });
}
