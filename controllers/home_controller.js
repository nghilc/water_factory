const home_controller = {
    show_home: async (req, res) => {
        try {
            res.render('layouts/home', {
                access_menu: req.user.access_tab,
                user_id: JSON.stringify(req.user.id),
                role: req.user.role,
                full_name: req.user.name,
                current_path: "/home",
                t: req.__
            })
        } catch (error) {
            console.error('API DMA error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    },
}

module.exports = home_controller;