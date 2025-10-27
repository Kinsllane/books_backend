"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../services/authService");
class AuthController {
    constructor() {
        this.authService = new authService_1.AuthService();
        this.register = async (req, res) => {
            try {
                const { username, password } = req.body;
                if (!username || !password) {
                    res.status(400).json({ error: 'Username and password are required' });
                    return;
                }
                const result = await this.authService.register(username, password);
                res.status(201).json(result);
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
        };
        this.login = async (req, res) => {
            try {
                const { username, password } = req.body;
                if (!username || !password) {
                    res.status(400).json({ error: 'Username and password are required' });
                    return;
                }
                const result = await this.authService.login(username, password);
                res.status(200).json(result);
            }
            catch (error) {
                res.status(401).json({ error: error.message });
            }
        };
    }
}
exports.AuthController = AuthController;
