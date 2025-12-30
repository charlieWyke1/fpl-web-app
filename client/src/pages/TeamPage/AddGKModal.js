import React from "react";
import "./AddModal.css";

const AddGKModal = ({
  show,
  onClose,
  gkOptions,
  budget,
  setBudget,
  setSelectedGK,
  selectedGK,
  activeGKIndex,
}) => {
  if (!show) return null;

  const handleClose = () => {
    const currentGk = selectedGK[activeGKIndex];
    if (currentGk) {
      // refund cost
      setBudget(budget - currentGk.cost);
    }
    onClose();
  };

  return (
    <div className="modalOverlay" onClick={handleClose}>
      <div className="modalContent" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <h3>Select a Goalkeeper</h3>
          <h4> Budget : £{budget.toFixed(2)}m</h4>
        </div>

        <table className="optionsTable">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Team</th>
              <th>Points</th>
            </tr>
          </thead>

          <tbody>
            {gkOptions.map((gk) => {
              // Check if this GK is already in selectedGK
              const isAlreadySelected = selectedGK.some(
                (player) => player?.id === gk.id
              );

              return (
                <tr
                  key={gk.id}
                  className={isAlreadySelected ? "disabledRow" : ""}
                  onClick={() => {
                    if (isAlreadySelected) return; // block clicking already selected GKs

                    // deduct cost
                    setBudget(budget - gk.cost);

                    // update selectedGK at the active slot
                    setSelectedGK((prev) => {
                      const updated = [...prev];
                      updated[activeGKIndex] = gk;
                      return updated;
                    });

                    onClose();
                  }}
                >
                  <td>{gk.name}</td>
                  <td>£{gk.cost}m</td>
                  <td>{gk.team}</td>
                  <td>{gk.totalPoints}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="modalFooter">
          <button className="closeBtn" onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
export default AddGKModal;
