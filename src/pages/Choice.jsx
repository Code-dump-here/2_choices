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
      alert('Failed to save your choice. Please try again.');
    }
  };

  const resetChoice = async () => {
    const participantId = localStorage.getItem('participantId');

    try {
      const { error } = await supabase
        .from('participants')
        .update({
          choice: null,
          choice_timestamp: null
        })
        .eq('id', participantId);

      if (error) throw error;

      setHasChoice(false);
      setCurrentChoice(null);
    } catch (error) {
      console.error('Error resetting choice:', error);
      alert('Failed to reset your choice. Please try again.');
    }
  };

  const leaveRoom = () => {
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
            <span className="room-code-display">Room: <strong>{roomCode}</strong></span>
            <span className="participant-name">👤 <strong>{participantName}</strong></span>
          </div>
        </div>

        <h1>Make Your Choice</h1>
        <p className="description">
          You are part of a social experiment. Choose one of the two options below.
          Your choice will be visible to the room admin.
        </p>

        {!hasChoice ? (
          <div className="choices">
            <button className="choice-btn cooperate" onClick={() => handleChoice('cooperate')}>
              <div className="btn-icon">🤝</div>
              <h2>Cooperate</h2>
              <p>Share with others</p>
            </button>

            <button className="choice-btn defect" onClick={() => handleChoice('defect')}>
              <div className="btn-icon">🚫</div>
              <h2>Defect</h2>
              <p>Keep for yourself</p>
            </button>
          </div>
        ) : (
          <div className="result">
            <p className="result-message">Choice Recorded!</p>
            <p className="result-detail" style={{ color: currentChoice === 'cooperate' ? '#4CAF50' : '#f44336' }}>
              {currentChoice === 'cooperate'
                ? 'You chose to COOPERATE. The admin can see your choice.'
                : 'You chose to DEFECT. The admin can see your choice.'}
            </p>
            <button className="reset-btn" onClick={resetChoice}>Change Choice</button>
          </div>
        )}

        <div className="footer">
          <button className="leave-link" onClick={leaveRoom}>← Leave Room</button>
        </div>
      </div>
    </div>
  );
}

export default Choice;
