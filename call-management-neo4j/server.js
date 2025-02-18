const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const callRoutes = require('./routes/callRoutes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/calls', callRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));