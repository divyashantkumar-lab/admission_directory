require('dotenv').config();
const app = require('./src/app');
const { PORT } = require('./src/config/constants');

app.listen(PORT, () => {
  console.log(`Portfolio API listening on http://localhost:${PORT}`);
});
