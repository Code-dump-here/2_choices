import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import './Admin.css';

function Admin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [roomCode, setRoomCode] = useState('');
  const [roomId, setRoomId] = useState('');
  const [participants, setParticipants] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    cooperateCount: 0,
    defectCount: 0,
    pendingCount: 0,
    cooperatePercent: 0,
    defectPercent: 0
  });

  useEffect(() => {
    // Get room info from URL or localStorage
    const code = searchParams.get('room') || localStorage.getItem('adminRoomCode');
    const adminRoomId = localStorage.getItem('adminRoomId');

    if (!code) {
      navigate('/');
      return;
    }

    setRoomCode(code);
    if (adminRoomId) {
      setRoomId(adminRoomId);
    }

    // Initialize
    initializeRoom(code, adminRoomId);
  }, [navigate, searchParams]);

  const initializeRoom = async (code, adminRoomId) => {
    const id = await getRoomId(code, adminRoomId);
    if (id) {
      setRoomId(id);
      await loadParticipants(id);
      subscribeToParticipants(id);
    }
  };

  const getRoomId = async (code, adminRoomId) => {
    if (adminRoomId) return adminRoomId;

    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('id')
        .eq('room_code', code)
        .single();

      if (error) {
        console.error('Error getting room:', error);
        return null;
      }

      localStorage.setItem('adminRoomId', data.id);
      return data.id;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  const loadParticipants = async (id) => {
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('room_id', id)
        .order('joined_at', { ascending: true });

      if (error) throw error;

      setParticipants(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  const calculateStats = (participantsList) => {
    const total = participantsList.length;
    const cooperateCount = participantsList.filter(p => p.choice === 'cooperate').length;
    const defectCount = participantsList.filter(p => p.choice === 'defect').length;
    const pendingCount = participantsList.filter(p => !p.choice).length;

    const cooperatePercent = total > 0 ? Math.round((cooperateCount / total) * 100) : 0;
    const defectPercent = total > 0 ? Math.round((defectCount / total) * 100) : 0;

    setStats({
      total,
      cooperateCount,
      defectCount,
      pendingCount,
      cooperatePercent,
      defectPercent
    });
  };

  const subscribeToParticipants = (id) => {
    const channel = supabase
      .channel('participants-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `room_id=eq.${id}`
        },
        (payload) => {
          console.log('Change received!', payload);
          loadParticipants(id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode).then(() => {
      alert('Room code copied to clipboard!');
    });
  };

  const closeRoom = async () => {
    if (!confirm('Are you sure you want to close this room? All participants will be removed.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('rooms')
        .update({ is_active: false })
        .eq('id', roomId);

      if (error) throw error;

      localStorage.removeItem('adminRoomId');
      localStorage.removeItem('adminRoomCode');
      navigate('/');
    } catch (error) {
      console.error('Error closing room:', error);
      alert('Failed to close room. Please try again.');
    }
  };

  const createNewRoom = () => {
    localStorage.removeItem('adminRoomId');
    localStorage.removeItem('adminRoomCode');
    navigate('/');
  };

  return (
    <div className="container admin-container">
      <div className="admin-panel">
        <div className="admin-header">
          <h1>📊 Admin Panel</h1>
          <div className="room-code-large">
            Room Code: <span>{roomCode}</span>
            <button className="copy-btn" onClick={copyRoomCode} title="Copy room code">📋</button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card total-card">
            <div className="stat-icon">👥</div>
            <h2>Participants</h2>
            <div className="stat-number">{stats.total}</div>
          </div>

          <div className="stat-card cooperate-card">
            <div className="stat-icon">🤝</div>
            <h2>Cooperate</h2>
            <div className="stat-number">{stats.cooperateCount}</div>
            <div className="stat-percent">{stats.cooperatePercent}%</div>
          </div>

          <div className="stat-card defect-card">
            <div className="stat-icon">🚫</div>
            <h2>Defect</h2>
            <div className="stat-number">{stats.defectCount}</div>
            <div className="stat-percent">{stats.defectPercent}%</div>
          </div>

          <div className="stat-card pending-card">
            <div className="stat-icon">⏳</div>
            <h2>Pending</h2>
            <div className="stat-number">{stats.pendingCount}</div>
          </div>
        </div>

        <div className="participants-section">
          <h3>Participants in Room <span className="live-indicator">🔴 LIVE</span></h3>
          <div className="participants-list">
            {participants.length === 0 ? (
              <p className="no-data">Waiting for participants to join...</p>
            ) : (
              participants.map((p, index) => {
                const joinTime = new Date(p.joined_at).toLocaleTimeString();
                const choiceTime = p.choice_timestamp ? new Date(p.choice_timestamp).toLocaleTimeString() : '';

                return (
                  <div key={p.id} className={`participant-card ${p.choice || 'no-choice'}`}>
                    <div className="participant-info">
                      <div className="participant-number">#{index + 1}</div>
                      <div className="participant-details">
                        <div className="participant-name">{p.name}</div>
                        <div className="participant-time">Joined: {joinTime}</div>
                        {choiceTime && <div className="participant-time">Chose: {choiceTime}</div>}
                      </div>
                    </div>
                    <div className="participant-choice">
                      {p.choice === 'cooperate' && <span className="choice-badge cooperate">🤝 Cooperate</span>}
                      {p.choice === 'defect' && <span className="choice-badge defect">🚫 Defect</span>}
                      {!p.choice && <span className="choice-badge pending">⏳ Pending</span>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="admin-actions">
          <button className="close-room-btn" onClick={closeRoom}>🚫 Close Room</button>
          <button className="new-room-btn" onClick={createNewRoom}>➕ Create New Room</button>
        </div>
      </div>

      <div className="footer">
        <button className="back-link" onClick={() => navigate('/')}>← Back to Home</button>
      </div>
    </div>
  );
}

export default Admin;
