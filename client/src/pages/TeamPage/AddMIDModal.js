import React from "react";
import "./AddModal.css";

const AddMIDModal = ({
  show,
  onClose,
  midOptions,
  budget,
  setBudget,
  setSelectedMID,
  selectedMID,
  activeMIDIndex,
}) => {
  if (!show) return null;

  const handleClose = () => {
    const currentMid = selectedMID[activeMIDIndex];
    if (currentMid) {
      // refund cost
      setBudget(budget - currentMid.cost);
    }
    onClose();
  };

  return (
    <div className="modalOverlay" onClick={handleClose}>
      <div className="modalContent" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <h3>Select a Midfielder</h3>
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
            {midOptions.map((mid) => {
              // Check if this MID is already in selectedMID
              const isAlreadySelected = selectedMID.some(
                (player) => player?.id === mid.id
              );

              return (
                <tr
                  key={mid.id}
                  className={isAlreadySelected ? "disabledRow" : ""}
                  onClick={() => {
                    if (isAlreadySelected) return; // block clicking already selected GKs

                    // deduct cost
                    setBudget(budget - mid.cost);

                    // update selectedMID at the active slot
                    setSelectedMID((prev) => {
                      const updated = [...prev];
                      updated[activeMIDIndex] = mid;
                      return updated;
                    });

                    onClose();
                  }}
                >
                  <td>{mid.name}</td>
                  <td>£{mid.cost}m</td>
                  <td>{mid.team}</td>
                  <td>{mid.totalPoints}</td>
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
export default AddMIDModal;
