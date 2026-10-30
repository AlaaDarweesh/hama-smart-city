const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// زيادة حجم البيانات المسموح إرسالها لدعم الصور (Base64)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(express.static(path.join(__dirname, 'public')));

const DATA_FILE = path.join(__dirname, 'data', 'feedback.json');

if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

const hamaBuildings = [
    { id: 1, name: "مبنى محافظة حماة", lat: 35.131089, lon: 36.756574, description: "المقر الرئيسي لمحافظة حماة" },
    { id: 2, name: "مديرية الخدمات الفنية - حماة", lat: 35.119220, lon: 36.755518, description: "مديرية الخدمات الفنية" }
];

app.get('/api/buildings', (req, res) => {
    res.json(hamaBuildings);
});

app.get('/api/feedbacks', (req, res) => {
    const feedbacks = JSON.parse(fs.readFileSync(DATA_FILE));
    res.json(feedbacks);
});

app.post('/api/feedback', (req, res) => {
    const { userName, userEmail, userLat, userLon, message, buildingName, category, image } = req.body;
    
    const feedbacks = JSON.parse(fs.readFileSync(DATA_FILE));
    const newEntry = {
        id: Date.now(),
        userName,
        userEmail,
        userLat,
        userLon,
        message,
        buildingName,
        category: category || "مقترح عام",
        image: image || null, // حفظ الصورة المرفقة
        status: "قيد المراجعة",
        date: new Date().toLocaleString('ar-SY')
    };
    
    feedbacks.push(newEntry);
    fs.writeFileSync(DATA_FILE, JSON.stringify(feedbacks, null, 2));
    
    res.json({ success: true, message: 'تم تسليم البلاغ الميداني مع الصورة المرفقة وتوثيقه بنجاح!' });
});

// توجيه خاص لصفحة لوحة التحكم الإدارية المنفصلة
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Admin panel available at http://localhost:${PORT}/admin`);
});
