const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 5001;

app.use(bodyParser.json());
app.use(cors());
mongoose.connect('mongodb+srv://user21:usertwoone@tm.ftekjyn.mongodb.net/?retryWrites=true&w=majority&appName=tm');

const transactionSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  dateOfSale: Date,
  category: String,
  sold: Boolean
});

const Transaction = mongoose.model('Transaction', transactionSchema);

app.get('/initialize', async (req, res) => {
  const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
  const data = response.data;
  data.forEach(item => {
    item.dateOfSale = new Date(item.dateOfSale);
  });
  await Transaction.insertMany(data);
  res.json({ message: 'Database initialized' });
});

app.get('/transactions', async (req, res) => {
  const month = req.query.month || 'March';
  const search = req.query.search || '';
  const page = parseInt(req.query.page, 10) || 1;
  const perPage = parseInt(req.query.per_page, 10) || 10;

  const monthNum = new Date(`${month} 1, 2020`).getMonth() + 1;
  const query = {
    $expr: { $eq: [{ $month: "$dateOfSale" }, monthNum] }
  };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { price: { $regex: search, $options: 'i' } }
    ];
  }

  const transactions = await Transaction.find(query)
    .skip((page - 1) * perPage)
    .limit(perPage);
  res.json(transactions);
});

app.get('/statistics', async (req, res) => {
  const month = req.query.month || 'March';
  const monthNum = new Date(`${month} 1, 2020`).getMonth() + 1;

  const totalSales = await Transaction.aggregate([
    { $match: { $expr: { $eq: [{ $month: "$dateOfSale" }, monthNum] }, sold: true } },
    { $group: { _id: null, total_sales: { $sum: "$price" } } }
  ]);

  const soldItems = await Transaction.countDocuments({ $expr: { $eq: [{ $month: "$dateOfSale" }, monthNum] }, sold: true });
  const notSoldItems = await Transaction.countDocuments({ $expr: { $eq: [{ $month: "$dateOfSale" }, monthNum] }, sold: false });

  res.json({ total_sales: totalSales[0]?.total_sales || 0, sold_items: soldItems, not_sold_items: notSoldItems });
});

app.get('/barchart', async (req, res) => {
  const month = req.query.month || 'March';
  const monthNum = new Date(`${month} 1, 2020`).getMonth() + 1;
  const priceRanges = {
    "0-100": 0,
    "101-200": 0,
    "201-300": 0,
    "301-400": 0,
    "401-500": 0,
    "501-600": 0,
    "601-700": 0,
    "701-800": 0,
    "801-900": 0,
    "901-above": 0
  };

  const transactions = await Transaction.find({ $expr: { $eq: [{ $month: "$dateOfSale" }, monthNum] } });
  transactions.forEach(t => {
    if (t.price <= 100) priceRanges["0-100"]++;
    else if (t.price <= 200) priceRanges["101-200"]++;
    else if (t.price <= 300) priceRanges["201-300"]++;
    else if (t.price <= 400) priceRanges["301-400"]++;
    else if (t.price <= 500) priceRanges["401-500"]++;
    else if (t.price <= 600) priceRanges["501-600"]++;
    else if (t.price <= 700) priceRanges["601-700"]++;
    else if (t.price <= 800) priceRanges["701-800"]++;
    else if (t.price <= 900) priceRanges["801-900"]++;
    else priceRanges["901-above"]++;
  });

  res.json(priceRanges);
});

app.get('/piechart', async (req, res) => {
  const month = req.query.month || 'March';
  const monthNum = new Date(`${month} 1, 2020`).getMonth() + 1;
  const categories = await Transaction.aggregate([
    { $match: { $expr: { $eq: [{ $month: "$dateOfSale" }, monthNum] } } },
    { $group: { _id: "$category", count: { $sum: 1 } } }
  ]);
  res.json(categories);
});

app.get('/combined', async (req, res) => {
  const month = req.query.month || 'March';
  const statistics = await axios.get(`http://localhost:${PORT}/statistics?month=${month}`).then(res => res.data);
  const barChart = await axios.get(`http://localhost:${PORT}/barchart?month=${month}`).then(res => res.data);
  const pieChart = await axios.get(`http://localhost:${PORT}/piechart?month=${month}`).then(res => res.data);

  res.json({
    statistics,
    bar_chart: barChart,
    pie_chart: pieChart
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
