import React from "react";
import "../TeamPage/AddModal.css";

const TransferFwdModal = ({
  show,
  onClose,
  fwdOptions,
  budget,
  setBudget,
  setTransfers,
  transfers,
  setSelectedFwd,
  selectedFwd,
  activeFwdIndex,
}) => {
  if (!show) return null;

  const handleClose = () => {
    const currentFwd = selectedFwd[activeFwdIndex];
    if (currentFwd) {
      // refund cost
      setBudget(budget - currentFwd.cost);
    }
    onClose();
  };

  return (
    <div className="modalOverlay" onClick={handleClose}>
      <div className="modalContent" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <h3>Select a Forward</h3>
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
            {fwdOptions.map((fwd) => {
              const isAlreadySelected = selectedFwd.some(
                (player) => player?.id === fwd.id,
              );

              return (
                <tr
                  key={fwd.id}
                  className={isAlreadySelected ? "disabledRow" : ""}
                  onClick={() => {
                    if (isAlreadySelected) return; // block clicking already selected GKs

                    // deduct cost
                    setBudget(budget - fwd.cost);

                    // update selectedGK at the active slot
                    setSelectedFwd((prev) => {
                      const updated = [...prev];
                      updated[activeFwdIndex] = fwd;
                      return updated;
                    });
                    setTransfers(transfers - 1);

                    onClose();
                  }}
                >
                  <td>{fwd.name}</td>
                  <td>£{fwd.cost}m</td>
                  <td>{fwd.team}</td>
                  <td>{fwd.totalPoints}</td>
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
export default TransferFwdModal;
