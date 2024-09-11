const budget = require("../models/budgetRequestModel");

// Add budget request
const reqBudget = (req, res) => {
  const { eid, budgetid, eventName, items, description, total, status } = req.body;

  // Create a new budget request
  const newBudget = new budget({
    eid,
    budgetid,
    eventName,
    items,
    description,
    total,
    status,
  });

  // Save the budget request to the database
  newBudget
    .save()
    .then(() => res.status(201).json({ message: "Budget request added" }))
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Failed to add budget request" });
    });
};

// Get all budget requests
const getBudgets = async (req, res) => {
  try {
    const allBudget = await budget.find();
    res.status(200).json({ allBudget });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a budget request
const deletebudget = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid budget request ID" });
    }

    const deleteBudget = await budget.findById(req.params.id);
    if (!deleteBudget) {
      return res.status(404).json({ error: "Budget request not found" });
    }

    await budget.findByIdAndRemove(req.params.id);
    res.status(200).json({ message: "Budget request deleted successfully", deleteBudget });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get one budget request by ID
const getbudget = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid budget request ID" });
  }

  try {
    const bud = await budget.findById(id);
    if (!bud) {
      return res.status(404).json({ error: "Budget request not found" });
    }
    res.status(200).json({ bud });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update budget request
const editbudget = async (req, res) => {
  const { id } = req.params;
  const { eid, eventName, items, description, total, status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid budget request ID" });
  }

  try {
    const bud = await budget.findById(id);
    if (!bud) {
      return res.status(404).json({ error: "Budget request not found" });
    }

    await budget.findByIdAndUpdate(id, { eid, eventName, items, description, total, status });
    res.status(200).json({ message: "Budget request updated" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { reqBudget, getBudgets, deletebudget, getbudget, editbudget };
