import React from 'react';

const RARITY_COLORS = {
  common: '#9ca3af',
  uncommon: '#4ade80',
  rare: '#60a5fa',
  legendary: '#fbbf24',
};

function FieldCard({ creature, onClick, canAttack, isTarget, isSelected }) {
  const borderColor = isSelected
    ? '#fbbf24'
    : isTarget
    ? '#ef4444'
    : canAttack
    ? '#4ade80'
    : '#374151';

  return (
    <div
      onClick={onClick}
      style={{
        width: '100px',
        minHeight: '130px',
        border: `2px solid ${borderColor}`,
        borderRadius: '8px',
        background: '#1a1a2e',
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'all 0.2s',
        boxShadow: isSelected
          ? '0 0 12px #fbbf24'
          : isTarget
          ? '0 0 12px #ef4444'
          : canAttack
          ? '0 0 8px #4ade80'
          : 'none',
        opacity: creature.summoning_sickness && !isTarget ? 0.7 : 1,
        position: 'relative',
      }}
    >
      {creature.summoning_sickness && (
        <div
          style={{
            position: 'absolute',
            top: '2px',
            left: '2px',
            fontSize: '10px',
            background: 'rgba(0,0,0,0.7)',
            borderRadius: '3px',
            padding: '1px 3px',
            color: '#fbbf24',
          }}
        >
          😴
        </div>
      )}
      {creature.has_attacked && (
        <div
          style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            fontSize: '10px',
            background: 'rgba(0,0,0,0.7)',
            borderRadius: '3px',
            padding: '1px 3px',
            color: '#9ca3af',
          }}
        >
          ✓
        </div>
      )}

      {/* Art area */}
      <div
        style={{
          height: '60px',
          background: creature.image_key ? '#2d1b69' : '#1e3a5f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
        }}
      >
        ⚔️
      </div>

      {/* Name */}
      <div
        style={{
          padding: '3px 4px',
          fontSize: '10px',
          fontWeight: 'bold',
          color: '#e2e8f0',
          textAlign: 'center',
          background: '#111827',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {creature.name}
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '4px 6px',
          marginTop: 'auto',
        }}
      >
        <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 'bold' }}>
          ⚔️{creature.attack}
        </span>
        <span style={{ fontSize: '12px', color: '#60a5fa', fontWeight: 'bold' }}>
          🛡️{creature.current_defense}
        </span>
      </div>
    </div>
  );
}

export default function Battlefield({
  myField = [],
  opponentField = [],
  onAttack,
  selectedAttacker,
  setSelectedAttacker,
  isMyTurn,
  disabled = false,
}) {
  const handleMyCreatureClick = (creature) => {
    if (!isMyTurn || disabled) return;
    if (creature.summoning_sickness || creature.has_attacked) return;
    if (selectedAttacker?.instance_id === creature.instance_id) {
      setSelectedAttacker(null);
    } else {
      setSelectedAttacker(creature);
    }
  };

  const handleOpponentCreatureClick = (creature) => {
    if (!isMyTurn || disabled || !selectedAttacker) return;
    onAttack && onAttack(selectedAttacker.instance_id, creature.instance_id);
    setSelectedAttacker(null);
  };

  const handleDirectAttack = () => {
    if (!isMyTurn || disabled || !selectedAttacker) return;
    if (opponentField.length > 0) return;
    onAttack && onAttack(selectedAttacker.instance_id, null);
    setSelectedAttacker(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      {/* Opponent field */}
      <div
        style={{
          minHeight: '150px',
          background: 'rgba(239,68,68,0.05)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '8px',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ fontSize: '11px', color: '#6b7280', marginRight: '4px', writingMode: 'vertical-rl' }}>
          OPP
        </div>
        {opponentField.length === 0 ? (
          <div
            style={{
              flex: 1,
              textAlign: 'center',
              color: '#4b5563',
              fontSize: '13px',
              fontStyle: 'italic',
              cursor: selectedAttacker && isMyTurn ? 'pointer' : 'default',
            }}
            onClick={handleDirectAttack}
          >
            {selectedAttacker && isMyTurn
              ? '⚡ Click to attack directly!'
              : 'No creatures'}
          </div>
        ) : (
          opponentField.map((creature) => (
            <FieldCard
              key={creature.instance_id}
              creature={creature}
              onClick={() => handleOpponentCreatureClick(creature)}
              canAttack={false}
              isTarget={!!selectedAttacker && isMyTurn}
              isSelected={false}
            />
          ))
        )}
      </div>

      {/* Divider */}
      <div
        style={{
          height: '2px',
          background: 'linear-gradient(to right, transparent, #374151, transparent)',
        }}
      />

      {/* My field */}
      <div
        style={{
          minHeight: '150px',
          background: 'rgba(74,222,128,0.05)',
          border: '1px solid rgba(74,222,128,0.2)',
          borderRadius: '8px',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ fontSize: '11px', color: '#6b7280', marginRight: '4px', writingMode: 'vertical-rl' }}>
          YOU
        </div>
        {myField.length === 0 ? (
          <div
            style={{
              flex: 1,
              textAlign: 'center',
              color: '#4b5563',
              fontSize: '13px',
              fontStyle: 'italic',
            }}
          >
            No creatures
          </div>
        ) : (
          myField.map((creature) => {
            const canAttack =
              isMyTurn &&
              !disabled &&
              !creature.summoning_sickness &&
              !creature.has_attacked;
            return (
              <FieldCard
                key={creature.instance_id}
                creature={creature}
                onClick={() => handleMyCreatureClick(creature)}
                canAttack={canAttack}
                isTarget={false}
                isSelected={selectedAttacker?.instance_id === creature.instance_id}
              />
            );
          })
        )}
      </div>
    </div>
  );
}