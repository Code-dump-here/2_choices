import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import './Choice.css';

function Choice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [hasChoice, setHasChoice] = useState(false);
  const [currentChoice, setCurrentChoice] = useState(null);
  const [participantName, setParticipantName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  useEffect(() => {
    // Get session data
    const participantId = localStorage.getItem('participantId');
    const name = localStorage.getItem('participantName');
    const code = localStorage.getItem('roomCode');

    if (!participantId || !code) {
      navigate('/');
      return;
    }

    setParticipantName(name);
    setRoomCode(code);

    // Check if participant already made a choice
    checkExistingChoice(participantId);
  }, [navigate]);

  const checkExistingChoice = async (participantId) => {
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('choice')
        .eq('id', participantId)
        .single();

      if (error) throw error;

      if (data.choice) {
        setCurrentChoice(data.choice);
        setHasChoice(true);
      }
    } catch (error) {
      console.error('Error checking existing choice:', error);
    }
  };

  const handleChoice = async (choice) => {
    const participantId = localStorage.getItem('participantId');

    try {
      const { error } = await supabase
        .from('participants')
        .update({
          choice: choice,
          choice_timestamp: new Date().toISOString()
        })
        .eq('id', participantId);

      if (error) throw error;

      setCurrentChoice(choice);
      setHasChoice(true);
    } catch (error) {
      console.error('Error saving choice:', error);
      alert('Không thể lưu lựa chọn của bạn. Vui lòng thử lại.');
    }
  };

  const leaveRoom = async () => {
    const participantId = localStorage.getItem('participantId');
    
    try {
      // Delete participant record from database
      if (participantId) {
        await supabase
          .from('participants')
          .delete()
          .eq('id', participantId);
      }
    } catch (error) {
      console.error('Error removing participant:', error);
    }
    
    localStorage.removeItem('participantId');
    localStorage.removeItem('participantName');
    localStorage.removeItem('roomCode');
    localStorage.removeItem('roomId');
    navigate('/');
  };

  return (
    <div className="container">
      <div className="experiment-box">
        <div className="room-header">
          <div className="room-info">
            <span className="room-code-display">Phòng: <strong>{roomCode}</strong></span>
            <span className="participant-name">👤 <strong>{participantName}</strong></span>
          </div>
        </div>

        <h1>Đưa Ra Lựa Chọn</h1>
        <p className="description">
          Bạn đang tham gia một thí nghiệm xã hội. Chọn một trong hai lựa chọn bên dưới.
          Lựa chọn của bạn sẽ hiển thị cho quản trị viên phòng.
        </p>

        {!hasChoice ? (
          <div className="choices">
            <button className="choice-btn cooperate" onClick={() => handleChoice('cooperate')}>
              <div className="btn-icon">🤝</div>
              <h2>Hợp Tác</h2>
              <p>Chia sẻ với người khác</p>
            </button>

            <button className="choice-btn defect" onClick={() => handleChoice('defect')}>
              <div className="btn-icon">🚫</div>
              <h2>Phản Bội</h2>
              <p>Giữ cho bản thân</p>
            </button>
          </div>
        ) : (
          <div className="result">
            <p className="result-message">Đã Ghi Nhận Lựa Chọn!</p>
            <p className="result-detail" style={{ color: currentChoice === 'cooperate' ? '#4CAF50' : '#f44336' }}>
              {currentChoice === 'cooperate'
                ? 'Bạn đã chọn HỢP TÁC. Quản trị viên có thể thấy lựa chọn của bạn.'
                : 'Bạn đã chọn PHẢN BỘI. Quản trị viên có thể thấy lựa chọn của bạn.'}
            </p>
            <p className="result-detail" style={{ fontSize: '0.9em', color: '#666', marginTop: '10px' }}>
              Lựa chọn của bạn đã được ghi nhận và không thể thay đổi.
            </p>
          </div>
        )}

        <div className="footer">
          <button className="leave-link" onClick={leaveRoom}>← Rời Phòng</button>
        </div>
      </div>
    </div>
  );
}

export default Choice;
