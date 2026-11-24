const uploadPhoto = async (photoFile: File | null) => {
    if (!photoFile) {
        return '';
    }

    // Convert file directly to Base64 Data URL (Cloud temporarily disabled)
    const fileBuffer = await photoFile.arrayBuffer();
    const base64 = Buffer.from(fileBuffer).toString('base64');
    const mimeType = photoFile.type || 'image/jpeg';
    return `data:${mimeType};base64,${base64}`;
};

export default uploadPhoto;
