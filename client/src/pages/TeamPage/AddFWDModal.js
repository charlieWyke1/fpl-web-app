import React from "react";
import "./AddModal.css";

const AddFWDModal = ({
  show,
  onClose,
  fwdOptions,
  budget,
  setBudget,
  setSelectedFWD,
  selectedFWD,
  activeFWDIndex,
}) => {
  if (!show) return null;

  const handleClose = () => {
    const currentFwd = selectedFWD[activeFWDIndex];
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
              // Check if this FWD is already in selectedFWD
              const isAlreadySelected = selectedFWD.some(
                (player) => player?.id === fwd.id
              );

              return (
                <tr
                  key={fwd.id}
                  className={isAlreadySelected ? "disabledRow" : ""}
                  onClick={() => {
                    if (isAlreadySelected) return; // block clicking already selected GKs

                    // deduct cost
                    setBudget(budget - fwd.cost);

                    // update selectedFWD at the active slot
                    setSelectedFWD((prev) => {
                      const updated = [...prev];
                      updated[activeFWDIndex] = fwd;
                      return updated;
                    });

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
export default AddFWDModal;
