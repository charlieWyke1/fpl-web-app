import React from "react";
import "./AddModal.css";

const AddDEFModal = ({
  show,
  onClose,
  defOptions,
  budget,
  setBudget,
  setSelectedDEF,
  selectedDEF,
  activeDEFIndex,
}) => {
  if (!show) return null;

  const handleClose = () => {
    const currentDef = selectedDEF[activeDEFIndex];
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
              // Check if this DEF is already in selectedDEF
              const isAlreadySelected = selectedDEF.some(
                (player) => player?.id === def.id
              );

              return (
                <tr
                  key={def.id}
                  className={isAlreadySelected ? "disabledRow" : ""}
                  onClick={() => {
                    if (isAlreadySelected) return; // block clicking already selected GKs

                    // deduct cost
                    setBudget(budget - def.cost);

                    // update selectedDEF at the active slot
                    setSelectedDEF((prev) => {
                      const updated = [...prev];
                      updated[activeDEFIndex] = def;
                      return updated;
                    });

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
export default AddDEFModal;
