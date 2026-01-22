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
    const isCreator = localStorage.getItem('isRoomCreator');

    if (!code) {
      navigate('/');
      return;
    }

    // Warn if accessing admin panel without being creator (but allow view-only access)
    if (!isCreator && !adminRoomId) {
      console.warn('Accessing admin panel without room creator credentials');
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

      if (error || !data) {
        console.error('Error getting room:', error);
        alert('Không tìm thấy phòng. Vui lòng kiểm tra mã phòng.');
        navigate('/');
        return null;
      }

      localStorage.setItem('adminRoomId', data.id);
      return data.id;
    } catch (error) {
      console.error('Error:', error);
      alert('Lỗi khi tải thông tin phòng.');
      navigate('/');
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
      .subscribe((status) => {
        if (status === 'SUBSCRIPTION_ERROR') {
          console.error('Failed to subscribe to realtime updates');
          alert('Cảnh báo: Cập nhật trực tiếp có thể không hoạt động. Hãy làm mới trang.');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode).then(() => {
      alert('Đã sao chép mã phòng!');
    });
  };

  const closeRoom = async () => {
    if (!confirm('Bạn có chắc chắn muốn đóng phòng này? Tất cả người tham gia sẽ bị xóa.')) {
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
      localStorage.removeItem('isRoomCreator');
      navigate('/');
    } catch (error) {
      console.error('Error closing room:', error);
      alert('Không thể đóng phòng. Vui lòng thử lại.');
    }
  };

  const createNewRoom = () => {
    localStorage.removeItem('adminRoomId');
    localStorage.removeItem('adminRoomCode');
    localStorage.removeItem('isRoomCreator');
    navigate('/');
  };

  return (
    <div className="container admin-container">
      <div className="admin-panel">
        <div className="admin-header">
          <h1>📊 Bảng Quản Trị</h1>
          <div className="room-code-large">
            Mã Phòng: <span>{roomCode}</span>
            <button className="copy-btn" onClick={copyRoomCode} title="Sao chép mã phòng">📋</button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card total-card">
            <div className="stat-icon">👥</div>
            <h2>Người Tham Gia</h2>
            <div className="stat-number">{stats.total}</div>
          </div>

          <div className="stat-card cooperate-card">
            <div className="stat-icon">🤝</div>
            <h2>Hợp Tác</h2>
            <div className="stat-number">{stats.cooperateCount}</div>
            <div className="stat-percent">{stats.cooperatePercent}%</div>
          </div>

          <div className="stat-card defect-card">
            <div className="stat-icon">🚫</div>
            <h2>Phản Bội</h2>
            <div className="stat-number">{stats.defectCount}</div>
            <div className="stat-percent">{stats.defectPercent}%</div>
          </div>

          <div className="stat-card pending-card">
            <div className="stat-icon">⏳</div>
            <h2>Chờ Đợi</h2>
            <div className="stat-number">{stats.pendingCount}</div>
          </div>
        </div>

        <div className="participants-section">
          <h3>Người Tham Gia Trong Phòng <span className="live-indicator">🔴 TRỰC TIẾP</span></h3>
          <div className="participants-list">
            {participants.length === 0 ? (
              <p className="no-data">Đang chờ người tham gia...</p>
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
                        <div className="participant-time">Tham gia: {joinTime}</div>
                        {choiceTime && <div className="participant-time">Chọn lúc: {choiceTime}</div>}
                      </div>
                    </div>
                    <div className="participant-choice">
                      {p.choice === 'cooperate' && <span className="choice-badge cooperate">🤝 Hợp Tác</span>}
                      {p.choice === 'defect' && <span className="choice-badge defect">🚫 Phản Bội</span>}
                      {!p.choice && <span className="choice-badge pending">⏳ Chờ Đợi</span>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="admin-actions">
          <button className="close-room-btn" onClick={closeRoom}>🚫 Đóng Phòng</button>
          <button className="new-room-btn" onClick={createNewRoom}>➕ Tạo Phòng Mới</button>
        </div>
      </div>

      <div className="footer">
        <button className="back-link" onClick={() => navigate('/')}>← Về Trang Chủ</button>
      </div>
    </div>
  );
}

export default Admin;
