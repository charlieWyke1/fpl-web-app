import React from "react";
import "../TeamPage/AddModal.css";

const TransferDefModal = ({
  show,
  onClose,
  defOptions,
  budget,
  setBudget,
  setTransfers,
  transfers,
  setSelectedDef,
  selectedDef,
  activeDefIndex,
}) => {
  if (!show) return null;

  const handleClose = () => {
    const currentDef = selectedDef[activeDefIndex];
    if (currentDef) {
      // refund cost
      setBudget(budget - currentDef.cost);
    }
    onClose();
  };

  return (
    <div className="modalOverlay" onClick={handleClose}>
      <div className="modalContent" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <h3>Select a Defender</h3>
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
            {defOptions.map((def) => {
              // Check if this GK is already in selectedGK
              const isAlreadySelected = selectedDef.some(
                (player) => player?.id === def.id,
              );

              return (
                <tr
                  key={def.id}
                  className={isAlreadySelected ? "disabledRow" : ""}
                  onClick={() => {
                    if (isAlreadySelected) return; // block clicking already selected GKs

                    // deduct cost
                    setBudget(budget - def.cost);

                    // update selectedGK at the active slot
                    setSelectedDef((prev) => {
                      const updated = [...prev];
                      updated[activeDefIndex] = def;
                      return updated;
                    });
                    setTransfers(transfers - 1);

                    onClose();
                  }}
                >
                  <td>{def.name}</td>
                  <td>£{def.cost}m</td>
                  <td>{def.team}</td>
                  <td>{def.totalPoints}</td>
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
export default TransferDefModal;
