"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const userService_1 = require("../services/userService");
class UserController {
    constructor() {
        this.userService = new userService_1.UserService();
        this.getAllUsers = async (req, res) => {
            try {
                const users = await this.userService.getAllUsers();
                res.status(200).json(users);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        };
        this.getMyProfile = async (req, res) => {
            try {
                if (!req.user) {
                    res.status(401).json({ error: 'Authentication required' });
                    return;
                }
                const authUser = req.user;
                const user = await this.userService.getUserById(authUser.id);
                res.status(200).json(user);
            }
            catch (error) {
                res.status(404).json({ error: error.message });
            }
        };
        this.getUserById = async (req, res) => {
            try {
                const { id } = req.params;
                const user = await this.userService.getUserById(id);
                res.status(200).json(user);
            }
            catch (error) {
                res.status(404).json({ error: error.message });
            }
        };
        this.updateProfile = async (req, res) => {
            try {
                if (!req.user) {
                    res.status(401).json({ error: 'Authentication required' });
                    return;
                }
                const authUser = req.user;
                const user = await this.userService.updateUser(authUser.id, req.body);
                res.status(200).json(user);
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
        };
        this.topUpBalance = async (req, res) => {
            try {
                if (!req.user) {
                    res.status(401).json({ error: 'Authentication required' });
                    return;
                }
                const authUser = req.user;
                const { amount } = req.body;
                const user = await this.userService.topUpBalance(authUser.id, amount);
                res.status(200).json(user);
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
        };
        this.deleteUser = async (req, res) => {
            try {
                if (!req.user) {
                    res.status(401).json({ error: 'Authentication required' });
                    return;
                }
                const authUser = req.user;
                const { id } = req.params;
                await this.userService.deleteUser(id, authUser.id);
                res.status(204).send();
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
        };
    }
}
exports.UserController = UserController;
