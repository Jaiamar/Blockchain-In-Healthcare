import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Building, Users, Activity, CheckCircle, AlertOctagon, Terminal, Server } from 'lucide-react';

const DOCTORS = [
    { id: 'DOC-102', name: 'Dr. Sarah Smith', department: 'General Practice', status: 'active', joined: '2022-01-15' },
    { id: 'DOC-205', name: 'Dr. James Wilson', department: 'Radiology', status: 'active', joined: '2023-05-20' },
    { id: 'DOC-491', name: 'Dr. Emily Chen', department: 'Cardiology', status: 'inactive', joined: '2021-11-10' },
];

const BLOCKCHAIN_EVENTS = [
    { id: 'BLK-88219', type: 'Node Joined', details: 'DOC-992 Registered to Hospital Node', time: '10 mins ago', status: 'success' },
    { id: 'BLK-88218', type: 'Smart Contract', details: 'Access Granted: Patient USR-892 -> DOC-205', time: '45 mins ago', status: 'success' },
    { id: 'BLK-88217', type: 'Data Block Added', details: 'Added 2.4MB Encrypted Record', time: '2 hours ago', status: 'success' },
    { id: 'BLK-88216', type: 'Node Sync Warning', details: 'Delay in syncing with public chain', time: '5 hours ago', status: 'warning' },
];

export default function AdminDashboard() {
    const { user } = useAuth();
    const [doctors, setDoctors] = useState(DOCTORS);

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Header */}
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Building size={32} color="var(--primary-color)" /> City General Hospital
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Hospital Node Administrator Dashboard</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div className="status-badge verified" style={{ marginBottom: '0.5rem', fontSize: '1rem', padding: '0.5rem 1rem' }}>
                        <Server size={16} /> Node Status: Fully Synced
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Last sync: 2 minutes ago</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(0, 242, 254, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={24} color="var(--primary-color)" />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>124</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Registered Doctors</div>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle size={24} color="var(--success)" />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>14,592</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Verified Blocks Mined</div>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Activity size={24} color="var(--warning)" />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>890.4 Mbps</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Network Throughput</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>

                {/* Manage Personnel */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Manage Hospital Personnel</h2>
                        <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>+ Register Doctor Node</button>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                <th style={{ padding: '1rem 0' }}>Doctor Name</th>
                                <th style={{ padding: '1rem 0' }}>ID</th>
                                <th style={{ padding: '1rem 0' }}>Department</th>
                                <th style={{ padding: '1rem 0' }}>Status</th>
                                <th style={{ padding: '1rem 0', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {doctors.map(d => (
                                <tr key={d.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem 0', fontWeight: 500 }}>{d.name}</td>
                                    <td style={{ padding: '1rem 0', fontFamily: 'monospace', color: 'var(--primary-color)' }}>{d.id}</td>
                                    <td style={{ padding: '1rem 0', color: 'var(--text-secondary)' }}>{d.department}</td>
                                    <td style={{ padding: '1rem 0' }}>
                                        {d.status === 'active' ? (
                                            <span className="status-badge verified">Active</span>
                                        ) : (
                                            <span className="status-badge pending" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>Inactive</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                                        <button style={{ color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem', hover: { color: 'white' } }}>Manage</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Blockchain Status Monitor */}
                <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Terminal size={20} color="var(--primary-color)" /> Node Transaction Logs
                    </h2>

                    <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                        {BLOCKCHAIN_EVENTS.map(ev => (
                            <div key={ev.id} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px dashed rgba(255,255,255,0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                    <span style={{ fontFamily: 'monospace', color: ev.status === 'success' ? 'var(--success)' : 'var(--warning)', fontSize: '0.875rem' }}>
                                        [{ev.id}] {ev.type}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{ev.time}</span>
                                </div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{ev.details}</div>
                            </div>
                        ))}
                    </div>

                    <button className="btn-secondary" style={{ width: '100%', marginTop: '1rem', fontSize: '0.875rem', padding: '0.75rem' }}>
                        View Full Logs
                    </button>
                </div>

            </div>
        </div>
    );
}
