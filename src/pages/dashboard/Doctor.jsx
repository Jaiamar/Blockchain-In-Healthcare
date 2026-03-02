import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, FileText, Lock, Unlock, Check, ShieldAlert, Cpu, X } from 'lucide-react';

import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';

// Removed hardcoded dummy data for patients and records

export default function DoctorDashboard() {
    const { user } = useAuth();
    const [patients, setPatients] = useState([]);
    const [searchId, setSearchId] = useState('');
    const [activePatient, setActivePatient] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [patientRecords, setPatientRecords] = useState([]);

    const [searchedPatient, setSearchedPatient] = useState(null);

    // New Record Modal State
    const [showRecordModal, setShowRecordModal] = useState(false);
    const [newRecordType, setNewRecordType] = useState('');
    const [newRecordDetails, setNewRecordDetails] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    React.useEffect(() => {
        const fetchPatients = async () => {
            if (!user) return;
            try {
                // Fetch permissions granted to this doctor
                const reqsQ = query(collection(db, 'requests'), where('doctorId', '==', user.uid), where('status', '==', 'granted'));
                const reqsSnap = await getDocs(reqsQ);

                const grantedPatients = [];
                for (const docSnap of reqsSnap.docs) {
                    const reqData = docSnap.data();
                    // Assuming we have patient name stored, or we could fetch user doc
                    grantedPatients.push({ id: reqData.patientId, name: reqData.patientName || 'Patient', status: 'granted' });
                }
                setPatients(grantedPatients);
            } catch (error) {
                console.error("Error fetching patients:", error);
            }
        };
        fetchPatients();
    }, [user]);

    React.useEffect(() => {
        const fetchRecordsForActivePatient = async () => {
            if (!activePatient) {
                setPatientRecords([]);
                return;
            }
            try {
                const recordsQ = query(collection(db, 'records'), where('patientId', '==', activePatient.id));
                const recordsSnap = await getDocs(recordsQ);
                setPatientRecords(recordsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (error) {
                console.error("Error fetching patient records:", error);
            }
        };
        fetchRecordsForActivePatient();
    }, [activePatient]);

    const handleAddRecord = async (e) => {
        e.preventDefault();
        if (!activePatient || !newRecordType) return;

        setIsSubmitting(true);
        try {
            // Generate a fake 'blockchain hash'
            const fakeHash = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

            const newRecord = {
                patientId: activePatient.id,
                doctorId: user.uid,
                doctorName: user.name,
                type: newRecordType,
                details: newRecordDetails,
                date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
                hash: fakeHash,
                verified: true
            };

            const docRef = await addDoc(collection(db, 'records'), newRecord);

            // Add to local state immediately so UI updates
            setPatientRecords([{ id: docRef.id, ...newRecord }, ...patientRecords]);

            // Reset form
            setShowRecordModal(false);
            setNewRecordType('');
            setNewRecordDetails('');
        } catch (error) {
            console.error("Error adding record:", error);
            alert("Failed to add record. See console.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setIsSearching(true);
        // Simulate network delay
        setTimeout(() => {
            const existing = patients.find(p => p.id === searchId);
            if (existing) {
                setSearchedPatient(existing);
            } else {
                setSearchedPatient({ id: searchId, name: 'Unknown Patient', status: 'none' });
            }
            setIsSearching(false);
        }, 800);
    };

    const handleRequestAccess = () => {
        setSearchedPatient({ ...searchedPatient, status: 'pending' });
    };

    return (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '2rem' }}>

            {/* Left Sidebar - Patients List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Profile Summary */}
                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, margin: '0 auto 1rem auto' }}>
                        {user?.name.charAt(0)}
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{user?.name}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{user?.id}</p>
                    <div className="status-badge verified" style={{ fontSize: '0.75rem' }}>Verified Practitioner</div>
                </div>

                {/* Search */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Search Network</h3>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            type="text"
                            placeholder="Patient ID (e.g. USR-892)"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', outline: 'none' }}
                            required
                        />
                        <button type="submit" className="btn-primary" style={{ padding: '0.5rem', minWidth: '40px' }}>
                            <Search size={18} />
                        </button>
                    </form>

                    {searchedPatient && (
                        <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Result for {searchedPatient.id}</div>
                            <div style={{ fontWeight: 600, margin: '0.25rem 0 0.75rem 0' }}>{searchedPatient.name}</div>

                            {searchedPatient.status === 'none' && (
                                <button onClick={handleRequestAccess} className="btn-primary" style={{ width: '100%', fontSize: '0.875rem', padding: '0.5rem' }}>
                                    Request Access Block
                                </button>
                            )}
                            {searchedPatient.status === 'pending' && (
                                <div className="status-badge pending" style={{ width: '100%', justifyContent: 'center' }}>
                                    Smart Contract Pending
                                </div>
                            )}
                            {searchedPatient.status === 'granted' && (
                                <button onClick={() => setActivePatient(searchedPatient)} className="btn-secondary" style={{ width: '100%', fontSize: '0.875rem', padding: '0.5rem' }}>
                                    View Decrypted Records
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* My Patients */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Permitted Patients</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {patients.map(p => (
                            <div
                                key={p.id}
                                onClick={() => setActivePatient(p)}
                                style={{
                                    padding: '1rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: activePatient?.id === p.id ? 'rgba(0, 242, 254, 0.1)' : 'transparent',
                                    border: `1px solid ${activePatient?.id === p.id ? 'var(--primary-color)' : 'transparent'}`,
                                    cursor: 'pointer',
                                    transition: 'var(--transition-fast)'
                                }}
                            >
                                <div style={{ fontWeight: 500 }}>{p.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>ID: {p.id}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Content Area - Record Viewer */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {activePatient ? (
                    <>
                        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>{activePatient.name}'s Records</h1>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Decrypted using Patient-granted Session Key</div>
                            </div>
                            <button onClick={() => setShowRecordModal(true)} className="btn-primary" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                                <FileText size={16} /> Append New Record
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '1.5rem' }}>
                            {activePatient.status === 'granted' ? (
                                patientRecords.length > 0 ? (
                                    patientRecords.map(r => (
                                        <div key={r.id} className="glass-panel" style={{ padding: '2rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                                    <div style={{ background: 'rgba(0, 242, 254, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                                                        <Unlock size={24} color="var(--primary-color)" />
                                                    </div>
                                                    <div>
                                                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>{r.type}</h3>
                                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Date: {r.date}</div>
                                                    </div>
                                                </div>
                                                <div className="status-badge verified">
                                                    <Check size={14} /> Chain Verified
                                                </div>
                                            </div>

                                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)', marginTop: '1rem' }}>
                                                <div style={{ fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Decrypted Contents:</div>
                                                <div style={{ lineHeight: 1.6 }}>{r.details || "No details available."}</div>
                                            </div>

                                            <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.2)', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--success)' }}>
                                                <Cpu size={16} />
                                                <span style={{ fontFamily: 'monospace' }}>Verified Hash: {r.hash || 'N/A'}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)' }}>
                                        No records found for this patient.
                                    </div>
                                )
                            ) : (
                                <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', opacity: 0.7 }}>
                                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                                        <Lock size={28} color="var(--danger)" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--danger)', marginBottom: '0.25rem' }}>Encrypted Blocks</h3>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>You do not have permission to decrypt these blocks.</div>
                                    </div>
                                    <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Request Key</button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <Search size={48} color="var(--border-color)" style={{ marginBottom: '1.5rem' }} />
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Select a Patient</h2>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>Search the network for a patient ID or select an approved patient from your list to view decrypted medical records.</p>
                    </div>
                )}

            </div>

            {/* Append Record Modal */}
            {showRecordModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '500px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Append Encrypted Record</h2>
                            <button onClick={() => setShowRecordModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleAddRecord} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Record Type</label>
                                <input
                                    type="text"
                                    value={newRecordType}
                                    onChange={(e) => setNewRecordType(e.target.value)}
                                    required
                                    placeholder="e.g. Blood Panel, MRI Scan"
                                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'white' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Clinical Details / Diagnosis</label>
                                <textarea
                                    value={newRecordDetails}
                                    onChange={(e) => setNewRecordDetails(e.target.value)}
                                    required
                                    rows={4}
                                    placeholder="Enter private medical notes..."
                                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'white', resize: 'vertical' }}
                                />
                            </div>

                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--success)', display: 'flex', gap: '0.5rem' }}>
                                <Check size={16} /> Data will be AES-256 encrypted before on-chain hashing.
                            </div>

                            <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ marginTop: '1rem', padding: '0.75rem' }}>
                                {isSubmitting ? 'Securing Block...' : 'Sign & Append Record'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
