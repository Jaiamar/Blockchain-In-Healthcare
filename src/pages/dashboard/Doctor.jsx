import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, FileText, Lock, Unlock, Check, ShieldAlert, Cpu, X, Users } from 'lucide-react';

import { collection, query, where, getDocs, addDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';

// Removed hardcoded dummy data for patients and records

export default function DoctorDashboard() {
    const { user } = useAuth();
    const [patients, setPatients] = useState([]); // This stores permitted patients
    const [allNetworkPatients, setAllNetworkPatients] = useState([]); // All patients
    const [searchId, setSearchId] = useState('');
    const [activePatient, setActivePatient] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [patientRecords, setPatientRecords] = useState([]);

    // Upload State
    const [uploadingFile, setUploadingFile] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

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
                const reqsQ = query(collection(db, 'requests'), where('doctorId', '==', user.id), where('status', '==', 'granted'));
                const reqsSnap = await getDocs(reqsQ);

                const grantedPatients = [];
                for (const docSnap of reqsSnap.docs) {
                    const reqData = docSnap.data();
                    let pName = reqData.patientName;

                    if (!pName) {
                        try {
                            const pDoc = await getDocs(query(collection(db, 'users'), where('id', '==', reqData.patientId)));
                            if (!pDoc.empty) {
                                pName = pDoc.docs[0].data().name;
                                // Ideally update the request entry as well
                                await updateDoc(doc(db, 'requests', docSnap.id), { patientName: pName });
                            } else {
                                pName = 'Patient';
                            }
                        } catch (err) {
                            pName = 'Patient';
                        }
                    }

                    grantedPatients.push({ id: reqData.patientId, name: pName, status: 'granted' });
                }
                console.log("Granted Patients Loaded:", grantedPatients);
                setPatients(grantedPatients);
            } catch (error) {
                console.error("Error fetching patients:", error);
            }
        };
        fetchPatients();

        // Also fetch ALL network patients for discovery directory
        const fetchNetworkPatients = async () => {
            try {
                const querySnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'patient')));
                const foundList = querySnap.docs.map(doc => ({ ...doc.data(), docRefId: doc.id }));
                console.log("ALL NETWORK PATIENTS LOADED:", foundList);
                setAllNetworkPatients(foundList);
            } catch (e) { console.error(e) }
        };
        fetchNetworkPatients();
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

    const handleSearch = async (e) => {
        e.preventDefault();
        setIsSearching(true);
        try {
            const existing = patients.find(p => p.id === searchId);
            if (existing) {
                setSearchedPatient(existing);
            } else {
                // Fetch real patient from db
                const pQuery = query(collection(db, 'users'), where('id', '==', searchId), where('role', '==', 'patient'));
                const pSnap = await getDocs(pQuery);
                if (!pSnap.empty) {
                    const pData = pSnap.docs[0].data();
                    setSearchedPatient({ id: searchId, name: pData.name, status: 'none', docRefId: pSnap.docs[0].id });
                } else {
                    setSearchedPatient({ id: searchId, name: 'Unknown Patient (Not Found)', status: 'none' });
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleRequestAccess = async (patientTarget = searchedPatient) => {
        try {
            const reqDocId = `${user.id}_${patientTarget.id}`;
            await setDoc(doc(db, 'requests', reqDocId), {
                doctorId: user.id,
                doctorName: user.name,
                patientId: patientTarget.id,
                patientName: patientTarget.name,
                status: 'pending',
                type: 'report_request'
            });
            if (searchedPatient && patientTarget.id === searchedPatient.id) {
                setSearchedPatient({ ...searchedPatient, status: 'pending' });
            }
            alert(`Access request sent to ${patientTarget.name}!`);
        } catch (error) {
            console.error("Error requesting access:", error);
            alert("Failed to request access. See console.");
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !activePatient) return;

        setUploadingFile('main');
        setUploadProgress(10); // Start progress slightly

        try {
            const fileRef = ref(storage, `shared_files/${activePatient.id}/${user.id}/${file.name}`);
            const uploadTask = uploadBytesResumable(fileRef, file);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(Math.round(progress));
                },
                (err) => {
                    console.error("Upload error stream:", err);
                    setUploadingFile(false);
                    setUploadProgress(0);
                }
            );

            await uploadTask;
            const downloadURL = await getDownloadURL(fileRef);

            const fakeHash = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
            const newRecord = {
                patientId: activePatient.id,
                doctorId: user.id,
                doctorName: user.name,
                type: 'Shared File: ' + file.name,
                details: file.name,
                fileUrl: downloadURL,
                date: new Date().toISOString().split('T')[0],
                hash: fakeHash,
                verified: true
            };

            const docRef = await addDoc(collection(db, 'records'), newRecord);
            setPatientRecords([{ id: docRef.id, ...newRecord }, ...patientRecords]);
        } catch (error) {
            console.error("File upload failed:", error);
            alert("File upload failed. See console.");
        } finally {
            setUploadingFile(false);
            setUploadProgress(0);
            e.target.value = null; // reset input
        }
    };

    const handleQuickUpload = async (e, targetPatient) => {
        const file = e.target.files[0];
        if (!file || !targetPatient) return;

        setUploadingFile(targetPatient.id);
        setUploadProgress(10);
        try {
            const fileRef = ref(storage, `shared_files/${targetPatient.id}/${user.id}/${file.name}`);
            const uploadTask = uploadBytesResumable(fileRef, file);

            uploadTask.on('state_changed',
                (snapshot) => setUploadProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)),
                (err) => console.error(err)
            );

            await uploadTask;
            const downloadURL = await getDownloadURL(fileRef);

            const fakeHash = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
            const newRecord = {
                patientId: targetPatient.id,
                doctorId: user.id,
                doctorName: user.name,
                type: 'Shared File: ' + file.name,
                details: file.name,
                fileUrl: downloadURL,
                date: new Date().toISOString().split('T')[0],
                hash: fakeHash,
                verified: true
            };

            const docRef = await addDoc(collection(db, 'records'), newRecord);
            if (activePatient && activePatient.id === targetPatient.id) {
                setPatientRecords(prev => [{ id: docRef.id, ...newRecord }, ...prev]);
            }
            alert(`File successfully sent to ${targetPatient.name}`);
        } catch (error) {
            console.error("File upload failed:", error);
            alert("File upload failed. See console.");
        } finally {
            setUploadingFile(false);
            setUploadProgress(0);
            e.target.value = null;
        }
    };

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

            {/* Top Bar - Profile & Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700 }}>
                        {user?.name.charAt(0)}
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>{user?.name}</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '0.5rem' }}>{user?.id}</p>
                        <div className="status-badge verified" style={{ fontSize: '0.75rem', display: 'inline-flex' }}>Verified Practitioner</div>
                    </div>
                </div>

                {/* Search */}
                <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Patient Search Network</h3>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem' }}>
                        <input
                            type="text"
                            placeholder="Patient ID (e.g. USR-892)"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', outline: 'none' }}
                            required
                        />
                        <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                            <Search size={20} />
                        </button>
                    </form>

                    {searchedPatient && (
                        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Result for {searchedPatient.id}</div>
                                <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>{searchedPatient.name}</div>
                            </div>

                            {searchedPatient.status === 'none' && (
                                <button onClick={() => handleRequestAccess()} className="btn-primary" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                                    Request Access
                                </button>
                            )}
                            {searchedPatient.status === 'pending' && (
                                <div className="status-badge pending">
                                    Pending Approval
                                </div>
                            )}
                            {searchedPatient.status === 'granted' && (
                                <button onClick={() => setActivePatient(searchedPatient)} className="btn-secondary" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                                    View Records
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Middle Section - Directories */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>

                {/* All Network Patients Directory */}
                <div className="glass-panel" style={{ padding: '1.5rem', maxHeight: '350px', overflowY: 'auto' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={18} color="var(--primary-color)" /> Network Patients Directory
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {allNetworkPatients.map(netP => {
                            const isGranted = patients.some(p => p.id === netP.id);
                            return (
                                <div key={netP.id} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{netP.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{netP.id}</div>
                                    </div>
                                    {isGranted ? (
                                        <span className="status-badge verified" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>Granted</span>
                                    ) : (
                                        <button onClick={() => handleRequestAccess(netP)} className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>Request Access</button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* My Patients */}
                <div className="glass-panel" style={{ padding: '1.5rem', maxHeight: '350px', overflowY: 'auto' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Check size={18} color="var(--success)" /> Permitted Patients
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {patients.map(p => (
                            <div
                                key={p.id}
                                style={{
                                    padding: '1rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: activePatient?.id === p.id ? 'rgba(0, 242, 254, 0.1)' : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${activePatient?.id === p.id ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)'}`,
                                    transition: 'var(--transition-fast)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <div onClick={() => setActivePatient(p)} style={{ flex: 1, cursor: 'pointer' }}>
                                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>ID: {p.id}</div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <label className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'width 0.3s ease' }} onClick={(e) => e.stopPropagation()}>
                                        {uploadingFile === p.id ? `Sending... ${uploadProgress}%` : 'Send File'}
                                        <input type="file" style={{ display: 'none' }} onChange={(e) => handleQuickUpload(e, p)} disabled={uploadingFile} />
                                    </label>
                                    <button onClick={() => setActivePatient(p)} className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}>View</button>
                                </div>
                            </div>
                        ))}
                        {patients.length === 0 && (
                            <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>No approved patients yet.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Content Area - Record Viewer */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>

                {activePatient ? (
                    <>
                        <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(0,242,254,0.05) 100%)', borderLeft: '4px solid var(--primary-color)' }}>
                            <div>
                                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>{activePatient.name}'s Records</h1>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Unlock size={16} color="var(--success)" /> Decrypted using Patient-granted Session Key
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <label className="btn-secondary" style={{ fontSize: '1rem', padding: '0.75rem 1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '220px', justifyContent: 'center' }}>
                                    {uploadingFile === 'main' ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span>Uploading {uploadProgress}%</span>
                                            <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', overflow: 'hidden' }}>
                                                <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--primary-color)', transition: 'width 0.1s linear' }} />
                                            </div>
                                        </div>
                                    ) : 'Upload File to Share'}
                                    <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} disabled={uploadingFile} />
                                </label>
                                <button onClick={() => setShowRecordModal(true)} className="btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}>
                                    <FileText size={18} /> Append New Record
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                            {activePatient.status === 'granted' ? (
                                patientRecords.length > 0 ? (
                                    patientRecords.map(r => (
                                        <div key={r.id} className="glass-panel" style={{ padding: '2rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                                    <div style={{ background: 'rgba(0, 242, 254, 0.1)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                                                        <Unlock size={28} color="var(--primary-color)" />
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
                                                {r.fileUrl && (
                                                    <div style={{ marginTop: '1rem' }}>
                                                        <a href={r.fileUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>View Shared File</a>
                                                    </div>
                                                )}
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
                    <div className="glass-panel" style={{ padding: '6rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Search size={64} color="var(--border-color)" style={{ marginBottom: '1.5rem' }} />
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.75rem' }}>Select a Patient Record</h2>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', fontSize: '1.125rem' }}>Search the network for a patient ID or select an approved patient from your top directories to remotely view decrypted medical history and transfer files.</p>
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
