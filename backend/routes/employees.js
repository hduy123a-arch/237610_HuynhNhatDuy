const router = require('express').Router();
const mongoose = require('mongoose');
const Employee = require('../models/Employee');

const find = (id) =>
  mongoose.isValidObjectId(id)
    ? Employee.findById(id)
    : Employee.findOne({ employeeId: id });

const validate = (b) => {
  if (!b.employeeId || !b.fullName || !b.email) return 'Thiếu mã nhân viên, họ tên hoặc email';
  if (!/^\S+@\S+\.\S+$/.test(b.email)) return 'Email không hợp lệ';
  return null;
};

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let filter = {};
    if (search) {
      const s = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter = { $or: [
        { employeeId: new RegExp(s, 'i') },
        { fullName: new RegExp(s, 'i') },
      ] };
    }
    res.json(await Employee.find(filter).sort({ employeeId: 1 }));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const emp = await find(req.params.id);
    if (!emp) return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    res.json(emp);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', async (req, res) => {
  const err = validate(req.body);
  if (err) return res.status(400).json({ message: err });
  try {
    res.status(201).json(await Employee.create(req.body));
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ message: 'Mã nhân viên đã tồn tại' });
    res.status(500).json({ message: e.message });
  }
});

router.put('/:id', async (req, res) => {
  const err = validate(req.body);
  if (err) return res.status(400).json({ message: err });
  try {
    const emp = await find(req.params.id);
    if (!emp) return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    Object.assign(emp, req.body);
    await emp.save();
    res.json(emp);
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ message: 'Mã nhân viên đã tồn tại' });
    res.status(500).json({ message: e.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const emp = await find(req.params.id);
    if (!emp) return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    await emp.deleteOne();
    res.json({ message: 'Đã xóa nhân viên' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
