import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import './Home.css';

function Home() {
  const navigate = useNavigate();
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
      const roomCode = generateRoomCode();

      const { data, error } = await supabase
        .from('rooms')
        .insert([{ room_code: roomCode, is_active: true }])
        .select()
        .single();

      if (error) throw error;

      // Store room info and redirect to admin page
      localStorage.setItem('adminRoomId', data.id);
      localStorage.setItem('adminRoomCode', data.room_code);
      navigate(`/admin?room=${data.room_code}`);
    } catch (error) {
      console.error('Error creating room:', error);
      showError('Failed to create room. Please check your Supabase configuration.');
    }
  };

  // Join an existing room
  const joinRoom = async (e) => {
    e.preventDefault();
    const name = joinName.trim();
    const code = joinCode.trim().toUpperCase();

    if (!name) {
      showError('Please enter your name');
      return;
    }

    if (!code || code.length !== 6) {
      showError('Please enter a valid 6-character room code');
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
        showError('Room not found or is no longer active');
        return;
      }

      // Add participant to room
      const { data: participant, error: participantError } = await supabase
        .from('participants')
        .insert([{
          room_id: room.id,
          name: name,
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
      navigate(`/choice?room=${code}`);
    } catch (error) {
      console.error('Error joining room:', error);
      showError('Failed to join room. Please try again.');
    }
  };

  return (
    <div className="container">
      <div className="experiment-box">
        <h1>🎮 The Choice Experiment</h1>
        <p className="description">
          A social experiment inspired by the Prisoner's Dilemma. Join a room to participate!
        </p>

        {/* Join Room Section */}
        <div className="section join-section">
          <h2>Join a Room</h2>
          <form onSubmit={joinRoom}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Enter your name"
                maxLength="50"
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Room Code (e.g., ABC123)"
                maxLength="6"
                style={{ textTransform: 'uppercase' }}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              />
            </div>
            <button type="submit" className="primary-btn">Join Room</button>
          </form>
        </div>

        <div className="divider">
          <span>OR</span>
        </div>

        {/* Create Room Section */}
        <div className="section create-section">
          <h2>Create a Room (Admin)</h2>
          <p className="section-description">Create a new session and get a room code to share with participants.</p>
          <button className="primary-btn admin-btn" onClick={createRoom}>Create New Room</button>
        </div>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
}

export default Home;
