import React from "react";
import "../TeamPage/AddModal.css";

const TransferMidModal = ({
  show,
  onClose,
  midOptions,
  budget,
  setBudget,
  setTransfers,
  transfers,
  setSelectedMid,
  selectedMid,
  activeMidIndex,
}) => {
  if (!show) return null;

  const handleClose = () => {
    const currentMid = selectedMid[activeMidIndex];
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
              // Check if this GK is already in selectedGK
              const isAlreadySelected = selectedMid.some(
                (player) => player?.id === mid.id,
              );

              return (
                <tr
                  key={mid.id}
                  className={isAlreadySelected ? "disabledRow" : ""}
                  onClick={() => {
                    if (isAlreadySelected) return; // block clicking already selected GKs

                    // deduct cost
                    setBudget(budget - mid.cost);

                    // update selectedGK at the active slot
                    setSelectedMid((prev) => {
                      const updated = [...prev];

                      const wasStarting = prev[activeMidIndex]?.isStarting ?? false
                      updated[activeMidIndex] = {
                        ...mid, isStarting: wasStarting
                      };
                      return updated;
                    });
                    setTransfers(transfers - 1);

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
export default TransferMidModal;
