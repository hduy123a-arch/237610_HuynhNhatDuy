import { useEffect, useState } from 'react';

const API = (import.meta.env.VITE_API_URL || '') + '/api/employees';
const empty = { employeeId:'', fullName:'', gender:'Nam', dateOfBirth:'', department:'',
  position:'', email:'', phone:'', hireDate:'', status:'Đang làm việc' };

export default function App() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const notify = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 4000);
  };

  const load = async (q = '') => {
    setLoading(true);
    try {
      const r = await fetch(`${API}?search=${encodeURIComponent(q)}`);
      if (!r.ok) throw new Error('Không tải được dữ liệu');
      setList(await r.json());
    } catch (e) { notify(e.message, false); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.employeeId || !form.fullName || !form.email)
      return notify('Vui lòng nhập mã NV, họ tên và email', false);
    try {
      const r = await fetch(editing ? `${API}/${editing}` : API, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || 'Thao tác thất bại');
      notify(editing ? 'Cập nhật thành công' : 'Thêm thành công');
      setForm(empty); setEditing(null); load(search);
    } catch (e) { notify(e.message, false); }
  };

  const edit = (emp) => { setForm({ ...empty, ...emp }); setEditing(emp._id); window.scrollTo(0, 0); };

  const remove = async (emp) => {
    if (!window.confirm(`Xóa nhân viên ${emp.fullName}?`)) return;
    try {
      const r = await fetch(`${API}/${emp._id}`, { method: 'DELETE' });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message);
      notify('Xóa thành công'); load(search);
    } catch (e) { notify(e.message, false); }
  };

  const fields = [
    ['employeeId','Mã NV'],['fullName','Họ tên'],['dateOfBirth','Ngày sinh','date'],
    ['department','Phòng ban'],['position','Chức vụ'],['email','Email','email'],
    ['phone','Số điện thoại'],['hireDate','Ngày vào làm','date'],
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 16, fontFamily: 'sans-serif' }}>
      <h1>Quản lý nhân sự</h1>
      {msg && <div style={{ padding: 10, marginBottom: 10, color: '#fff',
        background: msg.ok ? '#2e7d32' : '#c62828' }}>{msg.text}</div>}

      <form onSubmit={submit} style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:16 }}>
        {fields.map(([k, label, type]) => (
          <label key={k} style={{ display:'flex', flexDirection:'column', fontSize:12 }}>
            {label}
            <input type={type || 'text'} placeholder={label} value={form[k] || ''}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
          </label>
        ))}
        <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
          <option>Nam</option><option>Nữ</option><option>Khác</option>
        </select>
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option>Đang làm việc</option><option>Nghỉ việc</option><option>Nghỉ phép</option>
        </select>
        <button type="submit">{editing ? 'Cập nhật' : 'Thêm nhân viên'}</button>
        {editing && <button type="button" onClick={() => { setForm(empty); setEditing(null); }}>Hủy</button>}
      </form>

      <div style={{ marginBottom: 10 }}>
        <input placeholder="Tìm theo mã NV hoặc họ tên" value={search}
          onChange={(e) => setSearch(e.target.value)} style={{ width: 280 }} />
        <button onClick={() => load(search)}>Tìm</button>
        <button onClick={() => { setSearch(''); load(''); }}>Tất cả</button>
      </div>

      {loading ? <p>Đang tải dữ liệu...</p> : (
        <table border="1" cellPadding="6" style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr><th>Mã NV</th><th>Họ tên</th><th>Phòng ban</th><th>Chức vụ</th>
            <th>Email</th><th>SĐT</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
          <tbody>
            {list.length === 0 && <tr><td colSpan="8">Không có dữ liệu</td></tr>}
            {list.map((e) => (
              <tr key={e._id}>
                <td>{e.employeeId}</td><td>{e.fullName}</td><td>{e.department}</td>
                <td>{e.position}</td><td>{e.email}</td><td>{e.phone}</td><td>{e.status}</td>
                <td><button onClick={() => edit(e)}>Sửa</button>
                    <button onClick={() => remove(e)}>Xóa</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
