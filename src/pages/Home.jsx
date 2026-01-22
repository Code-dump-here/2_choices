import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import './Home.css';

function Home({ navigate }) {
  const [joinName, setJoinName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

  // Generate random 6-character room code
  const generateRoomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Show error message
  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  // Create a new room
  const createRoom = async () => {
    try {
      let roomCode;
      let attempts = 0;
      let data;
      
      // Try up to 5 times to generate a unique room code
      while (attempts < 5) {
        roomCode = generateRoomCode();
        
        // Check if room code already exists
        const { data: existing } = await supabase
          .from('rooms')
          .select('room_code')
          .eq('room_code', roomCode)
          .single();
        
        if (!existing) {
          // Code is unique, create the room
          const { data: newRoom, error } = await supabase
            .from('rooms')
            .insert([{ room_code: roomCode, is_active: true }])
            .select()
            .single();
          
          if (error) throw error;
          data = newRoom;
          break;
        }
        
        attempts++;
      }
      
      if (!data) {
        throw new Error('Could not generate unique room code');
      }

      // Store room info and redirect to admin page
      localStorage.setItem('adminRoomId', data.id);
      localStorage.setItem('adminRoomCode', data.room_code);
      localStorage.setItem('isRoomCreator', 'true'); // Mark as room creator
      navigate('admin', { room: data.room_code });
    } catch (error) {
      console.error('Error creating room:', error);
      showError('Không thể tạo phòng. Vui lòng kiểm tra cấu hình Supabase.');
    }
  };

  // Join an existing room
  const joinRoom = async (e) => {
    e.preventDefault();
    const name = joinName.trim();
    const code = joinCode.trim().toUpperCase();

    if (!name) {
      showError('Vui lòng nhập tên của bạn');
      return;
    }

    if (!code || code.length !== 6) {
      showError('Vui lòng nhập mã phòng hợp lệ gồm 6 ký tự');
      return;
    }

    try {
      // Check if room exists and is active
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_code', code)
        .eq('is_active', true)
        .single();

      if (roomError || !room) {
        showError('Không tìm thấy phòng hoặc phòng không còn hoạt động');
        return;
      }

      // Check if this session already joined the room
      const sessionId = localStorage.getItem('sessionId');
      const { data: existingParticipant } = await supabase
        .from('participants')
        .select('*')
        .eq('room_id', room.id)
        .eq('session_id', sessionId)
        .single();

      if (existingParticipant) {
        showError('Bạn đã tham gia phòng này rồi. Không thể tham gia lại.');
        return;
      }

      // Add participant to room
      const { data: participant, error: participantError } = await supabase
        .from('participants')
        .insert([{
          room_id: room.id,
          name: name,
          session_id: sessionId,
          choice: null
        }])
        .select()
        .single();

      if (participantError) throw participantError;

      // Store participant info and redirect to choice page
      localStorage.setItem('participantId', participant.id);
      localStorage.setItem('participantName', name);
      localStorage.setItem('roomCode', code);
      localStorage.setItem('roomId', room.id);
      navigate('choice', { room: code });
    } catch (error) {
      console.error('Error joining room:', error);
      showError('Không thể tham gia phòng. Vui lòng thử lại.');
    }
  };

  return (
    <div className="container">
      <div className="experiment-box">
        <h1>🎮 Thí Nghiệm Lựa Chọn</h1>
        <p className="description">
          Một thí nghiệm xã hội lấy cảm hứng từ Tình Huống Tù Nhân. Tham gia phòng để thử nghiệm!
        </p>

        {/* Join Room Section */}
        <div className="section join-section">
          <h2>Tham Gia Phòng</h2>
          <form onSubmit={joinRoom}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Nhập tên của bạn"
                maxLength="50"
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Mã Phòng (ví dụ: ABC123)"
                maxLength="6"
                style={{ textTransform: 'uppercase' }}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              />
            </div>
            <button type="submit" className="primary-btn">Tham Gia Phòng</button>
          </form>
        </div>

        <div className="divider">
          <span>HOẶC</span>
        </div>

        {/* Create Room Section */}
        <div className="section create-section">
          <h2>Tạo Phòng (Quản Trị)</h2>
          <p className="section-description">Tạo phiên mới và nhận mã phòng để chia sẻ với người tham gia.</p>
          <button className="primary-btn admin-btn" onClick={createRoom}>Tạo Phòng Mới</button>
        </div>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
}

export default Home;
