class IAuthController {
    async register(req, res) {
        throw new Error('Method not implemented');
    }

    async login(req, res) {
        throw new Error('Method not implemented');
    }

    generateToken(user) {
        throw new Error('Method not implemented');
    }
}

export default IAuthController;