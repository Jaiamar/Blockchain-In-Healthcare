import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Building, Users, Activity, CheckCircle, AlertOctagon, Terminal, Server } from 'lucide-react';

import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { db, firebaseConfig } from '../../firebase';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

// Removed hardcoded DOCTORS data

const BLOCKCHAIN_EVENTS = [
    { id: 'BLK-88219', type: 'Node Joined', details: 'DOC-992 Registered to Hospital Node', time: '10 mins ago', status: 'success' },
    { id: 'BLK-88218', type: 'Smart Contract', details: 'Access Granted: Patient USR-892 -> DOC-205', time: '45 mins ago', status: 'success' },
    { id: 'BLK-88217', type: 'Data Block Added', details: 'Added 2.4MB Encrypted Record', time: '2 hours ago', status: 'success' },
    { id: 'BLK-88216', type: 'Node Sync Warning', details: 'Delay in syncing with public chain', time: '5 hours ago', status: 'warning' },
];

export default function AdminDashboard() {
    const { user } = useAuth();
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [requests, setRequests] = useState([]);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);

    // Manual Creation State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createRole, setCreateRole] = useState('doctor');
    const [createName, setCreateName] = useState('');
    const [createEmail, setCreateEmail] = useState('');
    const [createPassword, setCreatePassword] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp_ManualCreate");
            const secondaryAuth = getAuth(secondaryApp);

            const generatedId = createRole === 'doctor'
                ? `DOC-${Math.floor(Math.random() * 10000)}`
                : `USR-${Math.floor(Math.random() * 10000)}`;

            const cred = await createUserWithEmailAndPassword(secondaryAuth, createEmail, createPassword);

            const newUserDoc = {
                email: createEmail,
                role: createRole,
                name: createName,
                id: generatedId,
                createdAt: new Date().toISOString()
            };

            if (createRole === 'doctor') {
                newUserDoc.department = 'General Base';
            }

            await setDoc(doc(db, 'users', cred.user.uid), newUserDoc);

            alert(`Successfully created ${createRole} node: ${createName} (${generatedId})`);

            // Auto update lists
            if (createRole === 'doctor') {
                setDoctors([{ uid: cred.user.uid, ...newUserDoc, status: 'active' }, ...doctors]);
            } else {
                setPatients([{ uid: cred.user.uid, ...newUserDoc, status: 'active' }, ...patients]);
            }

            setShowCreateModal(false);
            setCreateName('');
            setCreateEmail('');
            setCreatePassword('');
        } catch (error) {
            console.error("Error creating user:", error);
            alert("Failed to create user. " + error.message);
        } finally {
            setIsCreating(false);
        }
    };

    const handleSeedPatients = async () => {
        setSeeding(true);
        try {
            const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
            const secondaryAuth = getAuth(secondaryApp);

            const testPatients = [
                { name: 'John Doe', email: 'johndoe@healthchain.local', id: 'USR-1001' },
                { name: 'Alice Smith', email: 'alicesmith@healthchain.local', id: 'USR-1002' },
                { name: 'Bob Johnson', email: 'bobjohnson@healthchain.local', id: 'USR-1003' },
                { name: 'Emma Davis', email: 'emmadavis@healthchain.local', id: 'USR-1004' },
                { name: 'Michael Wilson', email: 'michaelwilson@healthchain.local', id: 'USR-1005' },
            ];

            for (const p of testPatients) {
                try {
                    const cred = await createUserWithEmailAndPassword(secondaryAuth, p.email, 'password123');
                    await setDoc(doc(db, 'users', cred.user.uid), {
                        email: p.email,
                        role: 'patient',
                        name: p.name,
                        id: p.id,
                        createdAt: new Date().toISOString()
                    });
                } catch (e) {
                    // Ignore if already exists for demo purposes
                    console.log(`Skipped ${p.email}:`, e.message);
                }
            }
            alert("Successfully generated 5 patient accounts! Emails listed in Patients tab. Password for all is 'password123'");
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert("Error seeding patients.");
        } finally {
            setSeeding(false);
        }
    };

    React.useEffect(() => {
        const fetchNetworkData = async () => {
            try {
                // Fetch Doctors
                const doctorsQ = query(collection(db, 'users'), where('role', '==', 'doctor'));
                const doctorsSnap = await getDocs(doctorsQ);
                setDoctors(doctorsSnap.docs.map(doc => ({ uid: doc.id, ...doc.data(), status: 'active', department: doc.data().department || 'General Base' })));

                // Fetch Patients
                const patientsQ = query(collection(db, 'users'), where('role', '==', 'patient'));
                const patientsSnap = await getDocs(patientsQ);
                setPatients(patientsSnap.docs.map(doc => ({ uid: doc.id, ...doc.data(), status: 'active' })));

                // Fetch Requests
                const requestsSnap = await getDocs(collection(db, 'requests'));
                setRequests(requestsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                // Fetch Records (Shared files/data blocks)
                const recordsSnap = await getDocs(collection(db, 'records'));
                setRecords(recordsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            } catch (error) {
                console.error("Error fetching admin data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNetworkData();
    }, []);

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
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <div className="status-badge verified" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                        <Server size={16} /> Node Status: Fully Synced
                    </div>
                    <button onClick={handleSeedPatients} disabled={seeding} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                        {seeding ? 'Generating Accounts...' : 'Generate 5 Test Patients'}
                    </button>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Admin Tools</div>
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
                        <button onClick={() => { setCreateRole('doctor'); setShowCreateModal(true); }} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>+ Register Doctor Node</button>
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
                            {doctors.length > 0 ? (
                                doctors.map(d => (
                                    <tr key={d.uid} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
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
                                            <button style={{ color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem' }}>Manage</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ padding: '1rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        No registered doctors found in the network.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2.5rem', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Manage Patient Nodes</h2>
                        <button onClick={() => { setCreateRole('patient'); setShowCreateModal(true); }} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>+ Register Patient Node</button>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                <th style={{ padding: '1rem 0' }}>Patient Name</th>
                                <th style={{ padding: '1rem 0' }}>Network ID</th>
                                <th style={{ padding: '1rem 0' }}>Status</th>
                                <th style={{ padding: '1rem 0', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.length > 0 ? (
                                patients.map(p => (
                                    <tr key={p.uid} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '1rem 0', fontWeight: 500 }}>{p.name}</td>
                                        <td style={{ padding: '1rem 0', fontFamily: 'monospace', color: 'var(--primary-color)' }}>{p.id}</td>
                                        <td style={{ padding: '1rem 0' }}>
                                            <span className="status-badge verified">Active</span>
                                        </td>
                                        <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                                            <button style={{ color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem' }}>Suspend</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ padding: '1rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        No registered patients found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Blockchain Status Monitor */}
                <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Terminal size={20} color="var(--primary-color)" /> Node Transaction Logs
                    </h2>

                    <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'white' }}>Currently Active Data Requests</h3>
                        {requests.length > 0 ? requests.map(req => (
                            <div key={req.id} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px dashed rgba(255,255,255,0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                    <span style={{ fontFamily: 'monospace', color: req.status === 'granted' ? 'var(--success)' : (req.status === 'revoked' ? 'var(--danger)' : 'var(--warning)'), fontSize: '0.875rem' }}>
                                        [{req.type}] {req.status.toUpperCase()}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>Doctor {req.doctorName} requested patient {req.patientId}</div>
                            </div>
                        )) : <div style={{ color: 'var(--text-secondary)' }}>No active requests on network.</div>}

                        <h3 style={{ fontSize: '1rem', marginTop: '2rem', marginBottom: '1rem', color: 'white' }}>Data Blocks / Shared Files</h3>
                        {records.length > 0 ? records.map(rec => (
                            <div key={rec.id} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px dashed rgba(255,255,255,0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                    <span style={{ fontFamily: 'monospace', color: 'var(--primary-color)', fontSize: '0.875rem' }}>
                                        [BLOCK ADD] {rec.type}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{rec.date}</span>
                                </div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>Linked Patient: {rec.patientId} | Appended by: {rec.doctorName}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.25rem' }}>Hash: {rec.hash.slice(0, 16)}...</div>
                            </div>
                        )) : <div style={{ color: 'var(--text-secondary)' }}>No records mined.</div>}
                    </div>

                    <button className="btn-secondary" style={{ width: '100%', marginTop: '1rem', fontSize: '0.875rem', padding: '0.75rem' }}>
                        View Full Logs
                    </button>
                </div>
            </div>

            {/* Create User Modal */}
            {showCreateModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(4px)' }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {createRole === 'doctor' ? <Users size={20} color="var(--primary-color)" /> : <Activity size={20} color="var(--success)" />}
                            Register New {createRole === 'doctor' ? 'Doctor' : 'Patient'}
                        </h2>

                        <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Full Name</label>
                                <input
                                    type="text" required value={createName} onChange={e => setCreateName(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'white' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Email</label>
                                <input
                                    type="email" required value={createEmail} onChange={e => setCreateEmail(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'white' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Initial Password</label>
                                <input
                                    type="password" required value={createPassword} onChange={e => setCreatePassword(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'white' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" disabled={isCreating} className="btn-primary" style={{ flex: 1, padding: '0.75rem' }}>{isCreating ? 'Creating...' : 'Create Node'}</button>
                                <button type="button" disabled={isCreating} onClick={() => setShowCreateModal(false)} className="btn-secondary" style={{ flex: 1, padding: '0.75rem' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
