import express from 'express';
const app = express();
const PORT = process.env.PORT || 5000;
app.get('/',async (req, res) => {
    res.send("Hello World");

});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
