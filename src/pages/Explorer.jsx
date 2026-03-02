import React, { useState } from 'react';
import { Activity, Database, Lock, Unlock, Hash, ChevronRight, CheckCircle, Cpu } from 'lucide-react';

import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

// Removed hardcoded BLOCKS and TRANSACTIONS data

export default function Explorer() {
    const [chainType, setChainType] = useState('all');
    const [blocks, setBlocks] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const fetchExplorerData = async () => {
            try {
                // Fetch recent blocks
                const blocksQ = query(collection(db, 'blocks'), orderBy('height', 'desc'), limit(10));
                const blocksSnap = await getDocs(blocksQ);
                setBlocks(blocksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                // Fetch recent transactions
                const txsQ = query(collection(db, 'transactions'), limit(10));
                const txsSnap = await getDocs(txsQ);
                setTransactions(txsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (error) {
                console.error("Error fetching explorer data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchExplorerData();
    }, []);

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                    <Activity size={36} color="var(--primary-color)" /> HealthChain Explorer
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>Real-time monitoring of the decentralized healthcare ledger</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', background: 'rgba(0, 242, 254, 0.1)', borderRadius: 'var(--radius-md)' }}><Database size={24} color="var(--primary-color)" /></div>
                    <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>849,312</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Block Height</div>
                    </div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)' }}><CheckCircle size={24} color="var(--success)" /></div>
                    <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>24.2M</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Verified Transactions</div>
                    </div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-md)' }}><Cpu size={24} color="var(--warning)" /></div>
                    <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>482</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Active Network Nodes</div>
                    </div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)' }}><Lock size={24} color="var(--danger)" /></div>
                    <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>AES-256</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Network Encryption</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                {/* Blocks Table */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Latest Blocks</h2>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={() => setChainType('all')}
                                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', borderRadius: 'var(--radius-sm)', background: chainType === 'all' ? 'rgba(0, 242, 254, 0.1)' : 'transparent', border: `1px solid ${chainType === 'all' ? 'var(--primary-color)' : 'var(--border-color)'}` }}
                            > All </button>
                            <button
                                onClick={() => setChainType('public')}
                                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', borderRadius: 'var(--radius-sm)', background: chainType === 'public' ? 'rgba(0, 242, 254, 0.1)' : 'transparent', border: `1px solid ${chainType === 'public' ? 'var(--primary-color)' : 'var(--border-color)'}` }}
                            > Public </button>
                            <button
                                onClick={() => setChainType('private')}
                                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', borderRadius: 'var(--radius-sm)', background: chainType === 'private' ? 'rgba(0, 242, 254, 0.1)' : 'transparent', border: `1px solid ${chainType === 'private' ? 'var(--primary-color)' : 'var(--border-color)'}` }}
                            > Private </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {blocks.filter(b => chainType === 'all' || b.type === chainType).length > 0 ? (
                            blocks.filter(b => chainType === 'all' || b.type === chainType).map(b => (
                                <div key={b.height || b.id} style={{ display: 'flex', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)', gap: '1.5rem' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                                        <Database size={20} color="var(--text-secondary)" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                            <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>#{b.height}</span>
                                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{b.age}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ fontSize: '0.875rem', display: 'flex', gap: '1rem' }}>
                                                <span>Miner: {b.miner}</span>
                                                <span style={{ color: 'var(--text-secondary)' }}>{b.txCount} txns</span>
                                            </div>
                                            <span className={b.type === 'public' ? 'status-badge verified' : 'status-badge pending'} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                                                {b.type === 'public' ? 'Public Chain' : 'Private Chain'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)' }}>
                                No blocks found on the network.
                            </div>
                        )}
                    </div>
                    <button className="btn-secondary" style={{ width: '100%', marginTop: '1.5rem', padding: '0.75rem' }}>View All Blocks</button>
                </div>

                {/* Transactions Table */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Latest Transactions</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {transactions.length > 0 ? (
                            transactions.map(tx => (
                                <div key={tx.id} style={{ display: 'flex', alignItems: 'flex-start', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)', gap: '1.5rem' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                                        <Hash size={20} color="var(--text-secondary)" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ fontWeight: 600 }}>{tx.title}</span>
                                            <span style={{ fontFamily: 'monospace', color: 'var(--primary-color)', fontSize: '0.875rem' }}>{tx.id}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                            <span style={{ background: 'rgba(0,0,0,0.3)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>{tx.from}</span>
                                            <ChevronRight size={14} />
                                            <span style={{ background: 'rgba(0,0,0,0.3)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>{tx.to}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                            <span style={{ color: 'var(--success)' }}>Payload: {tx.value}</span>
                                            <span>Fee: {tx.fee}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)' }}>
                                No transactions found on the network.
                            </div>
                        )}
                    </div>
                    <button className="btn-secondary" style={{ width: '100%', marginTop: '1.5rem', padding: '0.75rem' }}>View All Transactions</button>
                </div>

            </div>
        </div>
    );
}
