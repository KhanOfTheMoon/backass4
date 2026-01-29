const router = require("express").Router();
const { requireAuth, requireAdmin } = require("../middleware/auth");
const c = require("../controllers/bookController");

router.get("/", c.getAll);
router.get("/:id", c.getOne);

router.post("/", requireAuth, requireAdmin, c.create);
router.put("/:id", requireAuth, requireAdmin, c.update);
router.delete("/:id", requireAuth, requireAdmin, c.remove);

module.exports = router;