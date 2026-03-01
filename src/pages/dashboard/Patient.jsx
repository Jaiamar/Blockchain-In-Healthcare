import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Check, Shield, X, AlertTriangle, FileText, Activity, ShieldAlert, Cpu } from 'lucide-react';

// Simulated DB / Blockchain Records
const INITIAL_RECORDS = [
    { id: 'REC-8921', date: '2023-10-15', type: 'Blood Test', doctor: 'Dr. Sarah Smith', facility: 'City General', hash: '0x8f2a...9b1c' },
    { id: 'REC-9034', date: '2023-11-02', type: 'MRI Scan', doctor: 'Dr. James Wilson', facility: 'Metro Imaging', hash: '0x2c4e...7a5f' },
    { id: 'REC-9102', date: '2023-12-20', type: 'General Checkup', doctor: 'Dr. Sarah Smith', facility: 'City General', hash: '0x5d9b...3e8d' }
];

const INITIAL_REQUESTS = [
    { doctorId: 'DOC-102', name: 'Dr. Sarah Smith', role: 'General Practitioner', status: 'granted' },
    { doctorId: 'DOC-205', name: 'Dr. James Wilson', role: 'Radiologist', status: 'pending' },
];

const INITIAL_LOGS = [
    { id: 'TX-1189', time: '2 mins ago', action: 'Data Request', actor: 'DOC-205', status: 'pending' },
    { id: 'TX-1188', time: '1 week ago', action: 'Record Added', actor: 'DOC-102', status: 'verified' },
    { id: 'TX-1187', time: '2 weeks ago', action: 'Access Granted', actor: 'Patient', status: 'verified' },
];

export default function PatientDashboard() {
    const { user } = useAuth();
    const [records] = useState(INITIAL_RECORDS);
    const [requests, setRequests] = useState(INITIAL_REQUESTS);
    const [logs] = useState(INITIAL_LOGS);
    const [emergencyAccess, setEmergencyAccess] = useState(false);

    const handleGrant = (doctorId) => {
        setRequests(requests.map(req => req.doctorId === doctorId ? { ...req, status: 'granted' } : req));
    };

    const handleRevoke = (doctorId) => {
        setRequests(requests.map(req => req.doctorId === doctorId ? { ...req, status: 'revoked' } : req));
    };

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Header Profile */}
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '24px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700 }}>
                        {user?.name.charAt(0)}
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>{user?.name}</h1>
                        <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)' }}>
                            <span>ID: <strong>{user?.id}</strong></span>
                            <span>•</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Shield size={16} color="var(--success)" /> Node Secured</span>
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', background: emergencyAccess ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', border: emergencyAccess ? '1px solid rgba(239, 68, 68, 0.3)' : 'var(--glass-border)' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: emergencyAccess ? 'var(--danger)' : 'var(--text-primary)' }}>Emergency Access</span>
                        <div
                            onClick={() => setEmergencyAccess(!emergencyAccess)}
                            style={{ width: 44, height: 24, borderRadius: 12, background: emergencyAccess ? 'var(--danger)' : 'rgba(255,255,255,0.2)', position: 'relative', cursor: 'pointer', transition: 'var(--transition-normal)' }}
                        >
                            <div style={{ width: 20, height: 20, borderRadius: 10, background: 'white', position: 'absolute', top: 2, left: emergencyAccess ? 22 : 2, transition: 'var(--transition-normal)' }} />
                        </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Allows any licensed EMT read access during emergency</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Medical Records */}
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileText size={20} color="var(--primary-color)" /> Medical Records</h2>
                            <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Download All</button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {records.map(r => (
                                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{r.type}</h3>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{r.date} • {r.facility} • {r.doctor}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div className="status-badge verified" style={{ marginBottom: '0.5rem' }}>
                                            <Check size={14} /> Verified Block
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>Tx: {r.hash}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Permission Management */}
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}><ShieldAlert size={20} color="var(--primary-color)" /> Permission Management</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {requests.map(req => (
                                <div key={req.doctorId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{req.name}</h3>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>ID: {req.doctorId} • {req.role}</p>
                                    </div>
                                    <div>
                                        {req.status === 'pending' && (
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => handleGrant(req.doctorId)} style={{ padding: '0.5rem 1rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>Grant</button>
                                                <button onClick={() => handleRevoke(req.doctorId)} style={{ padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>Deny</button>
                                            </div>
                                        )}
                                        {req.status === 'granted' && (
                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                <span style={{ color: 'var(--success)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Check size={14} /> Active</span>
                                                <button onClick={() => handleRevoke(req.doctorId)} style={{ padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>Revoke</button>
                                            </div>
                                        )}
                                        {req.status === 'revoked' && (
                                            <span style={{ color: 'var(--danger)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><X size={14} /> Revoked</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Blockchain Activity Logs */}
                <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content' }}>
                    <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}><Activity size={20} color="var(--primary-color)" /> Access Logs</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '11px', top: '10px', bottom: '10px', width: '2px', background: 'rgba(255, 255, 255, 0.1)', zIndex: 0 }} />

                        {logs.map((log, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
                                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-surface)', border: `2px solid ${log.status === 'verified' ? 'var(--success)' : 'var(--warning)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '0.25rem', flexShrink: 0 }}>
                                    {log.status === 'verified' ? <Check size={12} color="var(--success)" /> : <Cpu size={12} color="var(--warning)" />}
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.125rem' }}>{log.time}</div>
                                    <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>{log.action}</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>by {log.actor}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--primary-color)', fontFamily: 'monospace', marginTop: '0.25rem' }}>Tx: {log.id}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="btn-secondary" style={{ width: '100%', marginTop: '2rem', padding: '0.75rem', fontSize: '0.875rem' }}>
                        View Full Explorer Log
                    </button>
                </div>
            </div>
        </div>
    );
}
