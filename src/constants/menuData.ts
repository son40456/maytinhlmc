
export interface MenuItemType {
    id: string;
    label: string;
    url: string;
    path: string;
    parentId: string | null;
    cssClasses: string[];
    children?: MenuItemType[];
    columns?: MenuItemType[][]; // For mega menu structure
    image?: string;
}

export const STATIC_MENU_ITEMS: MenuItemType[] = [
    {
        id: '148481',
        label: 'Bộ PC',
        path: '/pc-gaming-streaming',
        url: 'https://maytinhlmc.vn/pc-gaming-streaming',
        parentId: null,
        cssClasses: ['mega-menu-item-148481'],
        image: 'https://maytinhlmc.vn/wp-content/uploads/boPC.png',
        children: [
            { id: '148552', label: 'PC Gaming AMD', path: '/pc-gaming-amd', url: '', parentId: '148481', cssClasses: [] },
            { id: '148553', label: 'PC AI - Trí tuệ nhân tạo', path: '/pc-ai', url: '', parentId: '148481', cssClasses: [] },
            { id: '148557', label: 'PC Gaming Intel', path: '/pc-gaming-intel', url: '', parentId: '148481', cssClasses: [] },
            { id: '148558', label: 'Mini PC', path: '#', url: '', parentId: '148481', cssClasses: [] },
            { id: '148831', label: 'PC Giả Lập Ảo Hoá - Server', path: '/pc-xeon', url: '', parentId: '148481', cssClasses: [] },
            { id: '148832', label: 'PC Văn Phòng', path: '/pc-van-phong', url: '', parentId: '148481', cssClasses: [] },
        ]
    },
    {
        id: '148483',
        label: 'Mainboard',
        path: '/mainboard-bo-mach-chu',
        url: 'https://maytinhlmc.vn/mainboard-bo-mach-chu',
        parentId: null,
        cssClasses: ['mega-menu-item-148483'],
        image: 'https://maytinhlmc.vn/wp-content/uploads/MenuBgMain-1.png',
        columns: [
            [
                { id: '190617', label: 'Mainboard Intel', path: '/mainboard-intel', url: '', parentId: '148483', cssClasses: [] },
                { id: '190618', label: 'Mainboard AMD', path: '/mainboard-amd', url: '', parentId: '148483', cssClasses: [] }
            ],
            [
                { id: '190610', label: 'Mainboard MSI', path: '/mainboard-bo-mach-chu/?pa_thuong-hieu=msi', url: '', parentId: '148483', cssClasses: [] },
                { id: '190613', label: 'Mainboard Gigabyte', path: '/mainboard-bo-mach-chu/?pa_thuong-hieu=gigabyte', url: '', parentId: '148483', cssClasses: [] },
                { id: '190614', label: 'Mainboard ASUS', path: '/mainboard-bo-mach-chu/?pa_thuong-hieu=asus', url: '', parentId: '148483', cssClasses: [] },
                { id: '190615', label: 'Mainboard Colorful', path: '/mainboard-bo-mach-chu/?pa_thuong-hieu=colorful', url: '', parentId: '148483', cssClasses: [] },
                { id: '190616', label: 'Mainboard ASROCK', path: '/mainboard-bo-mach-chu/?pa_thuong-hieu=asrock', url: '', parentId: '148483', cssClasses: [] }
            ],
            [
                { id: '190619', label: 'Mainboard Intel Z790', path: '/mainboard-bo-mach-chu/?pa_chipset=intel-z790', url: '', parentId: '148483', cssClasses: [] },
                { id: '190620', label: 'Mainboard Intel Z890', path: '/mainboard-bo-mach-chu/?pa_chipset=intel-z890', url: '', parentId: '148483', cssClasses: [] },
                { id: '190621', label: 'Mainboard Intel B760', path: '/mainboard-bo-mach-chu/?pa_chipset=intel-b760', url: '', parentId: '148483', cssClasses: [] },
                { id: '190622', label: 'Mainboard Intel Z690', path: '/mainboard-bo-mach-chu/?pa_chipset=intel-z690', url: '', parentId: '148483', cssClasses: [] },
                { id: '190623', label: 'Mainboard Intel B860', path: '/mainboard-bo-mach-chu/?pa_chipset=intel-b860', url: '', parentId: '148483', cssClasses: [] }
            ],
            [
                { id: '190624', label: 'Mainboard AMD B850', path: '/mainboard-bo-mach-chu/?pa_chipset=amd-b850', url: '', parentId: '148483', cssClasses: [] },
                { id: '190625', label: 'Mainboard AMD B650', path: '/mainboard-bo-mach-chu/?pa_chipset=amd-b650', url: '', parentId: '148483', cssClasses: [] },
                { id: '190626', label: 'Mainboard AMD B550', path: '/mainboard-bo-mach-chu/?pa_chipset=amd-b550', url: '', parentId: '148483', cssClasses: [] }
            ]
        ]
    },
    {
        id: '148484',
        label: 'CPU',
        path: '/cpu-bo-vi-xu-ly',
        url: 'https://maytinhlmc.vn/cpu-bo-vi-xu-ly',
        parentId: null,
        cssClasses: ['mega-menu-item-148484'],
        image: 'https://maytinhlmc.vn/wp-content/uploads/Menu_CPUBg.png',
        columns: [
            [
                { id: '190650', label: 'CPU Intel Core i3', path: '/cpu-bo-vi-xu-ly?pa_dong-cpu=intel-core-i3', url: '', parentId: '148484', cssClasses: [] },
                { id: '190638', label: 'CPU Intel Core i5', path: '/cpu-bo-vi-xu-ly?pa_dong-cpu=intel-core-i5', url: '', parentId: '148484', cssClasses: [] },
                { id: '190649', label: 'CPU Intel Core i7', path: '/cpu-bo-vi-xu-ly?pa_dong-cpu=intel-core-i7', url: '', parentId: '148484', cssClasses: [] },
                { id: '190651', label: 'CPU Intel Core i9', path: '/cpu-bo-vi-xu-ly?pa_dong-cpu=intel-core-i9', url: '', parentId: '148484', cssClasses: [] },
                { id: '190647', label: 'CPU Intel Core Ultra 5', path: '/cpu-bo-vi-xu-ly?pa_dong-cpu=intel-core-ultra-5', url: '', parentId: '148484', cssClasses: [] },
                { id: '190648', label: 'CPU Intel Core Ultra 7', path: '/cpu-bo-vi-xu-ly?pa_dong-cpu=intel-core-ultra-7', url: '', parentId: '148484', cssClasses: [] }
            ],
            [
                { id: '190637', label: 'CPU AMD Ryzen 5', path: '/cpu-bo-vi-xu-ly?pa_dong-cpu=amd-ryzen-5', url: '', parentId: '148484', cssClasses: [] },
                { id: '190646', label: 'CPU AMD Ryzen 7', path: '/cpu-bo-vi-xu-ly?pa_dong-cpu=amd-ryzen-7', url: '', parentId: '148484', cssClasses: [] },
                { id: '190645', label: 'CPU AMD Ryzen 9', path: '/cpu-bo-vi-xu-ly?pa_dong-cpu=amd-ryzen-9', url: '', parentId: '148484', cssClasses: [] }
            ]
        ]
    },
    {
        id: '148485',
        label: 'RAM',
        path: '/ram-bo-nho-trong',
        url: 'https://maytinhlmc.vn/ram-bo-nho-trong',
        parentId: null,
        cssClasses: ['mega-menu-item-148485'],
        image: 'https://maytinhlmc.vn/wp-content/uploads/Menu_RAM_BG.png',
        columns: [
            [
                { id: '190653', label: 'RAM DDR3', path: '/ram-ddr3', url: '', parentId: '148485', cssClasses: [] },
                { id: '190654', label: 'RAM DDR4', path: '/ram-ddr4', url: '', parentId: '148485', cssClasses: [] },
                { id: '190655', label: 'RAM DDR5', path: '/ram-ddr5', url: '', parentId: '148485', cssClasses: [] }
            ],
            [
                { id: '190658', label: 'RAM ADATA', path: '/ram-bo-nho-trong/?pa_thuong-hieu=adata', url: '', parentId: '148485', cssClasses: [] },
                { id: '190659', label: 'RAM Lexar', path: '/ram-bo-nho-trong/?pa_thuong-hieu=lexar', url: '', parentId: '148485', cssClasses: [] },
                { id: '190657', label: 'RAM TEAMGROUP', path: '/ram-bo-nho-trong/?pa_thuong-hieu=teamgroup', url: '', parentId: '148485', cssClasses: [] }
            ],
            [
                { id: '190656', label: 'RAM Corsair', path: '/ram-bo-nho-trong/?pa_thuong-hieu=corsair', url: '', parentId: '148485', cssClasses: [] },
                { id: '190660', label: 'RAM Gskill', path: '/ram-bo-nho-trong/?pa_thuong-hieu=gskill', url: '', parentId: '148485', cssClasses: [] }
            ]
        ]
    },
    {
        id: '148486',
        label: 'VGA',
        path: '/vga-card-man-hinh',
        url: 'https://maytinhlmc.vn/vga-card-man-hinh',
        parentId: null,
        cssClasses: ['mega-menu-item-148486'],
        image: 'https://maytinhlmc.vn/wp-content/uploads/Menu_VGA_BG.png',
        columns: [
            [
                { id: '190386', label: 'VGA Nvidia', path: '/vga-nvidia', url: '', parentId: '148486', cssClasses: [] },
                { id: '190385', label: 'VGA AMD', path: '/vga-amd', url: '', parentId: '148486', cssClasses: [] },
                { id: '190384', label: 'VGA Đã qua sử dụng', path: '/vga-da-qua-su-dung', url: '', parentId: '148486', cssClasses: [] }
            ],
            [
                { id: '190664', label: 'VGA MSI', path: '/vga-card-man-hinh/?pa_thuong-hieu=msi', url: '', parentId: '148486', cssClasses: [] },
                { id: '190666', label: 'VGA GIGABYTE', path: '/vga-card-man-hinh/?pa_thuong-hieu=gigabyte', url: '', parentId: '148486', cssClasses: [] },
                { id: '190667', label: 'VGA COLORFUL', path: '/vga-card-man-hinh/?pa_thuong-hieu=colorful', url: '', parentId: '148486', cssClasses: [] },
                { id: '190670', label: 'VGA ASUS', path: '/vga-card-man-hinh/?pa_thuong-hieu=asus', url: '', parentId: '148486', cssClasses: [] },
                { id: '190665', label: 'VGA PNY', path: '/vga-card-man-hinh/?pa_thuong-hieu=pny', url: '', parentId: '148486', cssClasses: [] },
                { id: '190668', label: 'VGA SAPPHIRE', path: '/vga-card-man-hinh/?pa_thuong-hieu=sapphire', url: '', parentId: '148486', cssClasses: [] },
                { id: '190669', label: 'VGA ASROCK', path: '/vga-card-man-hinh/?pa_thuong-hieu=asrock', url: '', parentId: '148486', cssClasses: [] }
            ],
            [
                { id: '190672', label: 'NVIDIA RTX 5060 Ti', path: '/vga-card-man-hinh/?pa_gpu=nvidia-rtx-5060-ti', url: '', parentId: '148486', cssClasses: [] },
                { id: '190671', label: 'NVIDIA RTX 5070', path: '/vga-card-man-hinh/?pa_gpu=nvidia-rtx-5070', url: '', parentId: '148486', cssClasses: [] },
                { id: '190673', label: 'NVIDIA RTX 5070 Ti', path: '/vga-card-man-hinh/?pa_gpu=nvidia-rtx-5070-ti', url: '', parentId: '148486', cssClasses: [] }
            ],
            [
                { id: '190676', label: 'NVIDIA RTX 4060', path: '/vga-card-man-hinh/?pa_gpu=nvidia-rtx-4060', url: '', parentId: '148486', cssClasses: [] },
                { id: '190675', label: 'NVIDIA RTX 4060 Ti', path: '/vga-card-man-hinh/?pa_gpu=nvidia-rtx-4060-ti', url: '', parentId: '148486', cssClasses: [] },
                { id: '190674', label: 'NVIDIA RTX 4070', path: '/vga-card-man-hinh/?pa_gpu=nvidia-rtx-4070', url: '', parentId: '148486', cssClasses: [] }
            ]
        ]
    },
    {
        id: '166376',
        label: 'Ổ cứng HDD',
        path: '/o-cung-hdd',
        url: 'https://maytinhlmc.vn/o-cung-hdd',
        parentId: null,
        cssClasses: ['mega-menu-item-166376'],
        image: 'https://maytinhlmc.vn/wp-content/uploads/Menu_HDD_bg.png',
        columns: [
            [
                { id: '190794', label: 'HDD Seagate', path: '/o-cung-hdd?pa_thuong-hieu=seagate', url: '', parentId: '166376', cssClasses: [] },
                { id: '190795', label: 'HDD Western Digital', path: '/o-cung-hdd?pa_thuong-hieu=western-digital', url: '', parentId: '166376', cssClasses: [] }
            ],
            [
                { id: '190804', label: 'HDD 1TB', path: '/o-cung-hdd?pa_dung-luong=1tb', url: '', parentId: '166376', cssClasses: [] },
                { id: '190803', label: 'HDD 2TB', path: '/o-cung-hdd?pa_dung-luong=2tb', url: '', parentId: '166376', cssClasses: [] },
                { id: '190802', label: 'HDD 3TB', path: '/o-cung-hdd?pa_dung-luong=3tb', url: '', parentId: '166376', cssClasses: [] },
                { id: '190801', label: 'HDD 4TB', path: '/o-cung-hdd?pa_dung-luong=4tb', url: '', parentId: '166376', cssClasses: [] },
                { id: '190800', label: 'HDD 6TB', path: '/o-cung-hdd?pa_dung-luong=6tb', url: '', parentId: '166376', cssClasses: [] },
                { id: '190799', label: 'HDD 14TB', path: '/o-cung-hdd?pa_dung-luong=14tb', url: '', parentId: '166376', cssClasses: [] },
                { id: '190798', label: 'HDD 16TB', path: '/o-cung-hdd?pa_dung-luong=16tb', url: '', parentId: '166376', cssClasses: [] }
            ],
            [
                { id: 'p1', label: 'HDD dưới 2 triệu', path: '/o-cung-hdd?pa_khoang-gia-hdd=duoi-2-trieu', url: '', parentId: '166376', cssClasses: [] },
                { id: 'p2', label: 'HDD 2 triệu - 4 triệu', path: '/o-cung-hdd?pa_khoang-gia-hdd=2-trieu-4-trieu', url: '', parentId: '166376', cssClasses: [] },
                { id: 'p3', label: 'HDD 4 triệu - 8 triệu', path: '/o-cung-hdd?pa_khoang-gia-hdd=4-trieu-8-trieu', url: '', parentId: '166376', cssClasses: [] },
                { id: 'p4', label: 'HDD trên 8 triệu', path: '/o-cung-hdd?pa_khoang-gia-hdd=tren-8-trieu', url: '', parentId: '166376', cssClasses: [] }
            ]
        ]
    },
    {
        id: '187926',
        label: 'Ổ cứng SSD',
        path: '/o-cung-ssd',
        url: 'https://maytinhlmc.vn/o-cung-ssd',
        parentId: null,
        cssClasses: ['mega-menu-item-187926'],
        image: 'https://maytinhlmc.vn/wp-content/uploads/Menu_SSD_bg.png',
        columns: [
            [
                { id: 's1', label: 'SSD ADATA', path: '/o-cung-ssd?pa_thuong-hieu=adata', url: '', parentId: '187926', cssClasses: [] },
                { id: 's2', label: 'SSD PNY', path: '/o-cung-ssd?pa_thuong-hieu=pny', url: '', parentId: '187926', cssClasses: [] },
                { id: 's3', label: 'SSD Lexar', path: '/o-cung-ssd?pa_thuong-hieu=lexar', url: '', parentId: '187926', cssClasses: [] },
                { id: 's4', label: 'SSD MSI', path: '/o-cung-ssd?pa_thuong-hieu=msi', url: '', parentId: '187926', cssClasses: [] },
                { id: 's5', label: 'SSD Hiksemi', path: '/o-cung-ssd?pa_thuong-hieu=hiksemi', url: '', parentId: '187926', cssClasses: [] },
                { id: 's6', label: 'SSD Kingston', path: '/o-cung-ssd?pa_thuong-hieu=kingston', url: '', parentId: '187926', cssClasses: [] },
                { id: 's7', label: 'SSD Samsung', path: '/o-cung-ssd?pa_thuong-hieu=samsung', url: '', parentId: '187926', cssClasses: [] },
                { id: 's8', label: 'SSD KIOXIA', path: '/o-cung-ssd?pa_thuong-hieu=kioxia', url: '', parentId: '187926', cssClasses: [] },
                { id: 's9', label: 'SSD Gigabyte', path: '/o-cung-ssd?pa_thuong-hieu=gigabyte', url: '', parentId: '187926', cssClasses: [] },
                { id: 's10', label: 'SSD TEAMGROUP', path: '/o-cung-ssd?pa_thuong-hieu=teamgroup', url: '', parentId: '187926', cssClasses: [] },
                { id: 's11', label: 'SSD Western Digital', path: '/o-cung-ssd?pa_thuong-hieu=western-digital', url: '', parentId: '187926', cssClasses: [] }
            ],
            [
                { id: 'd1', label: 'SSD 120GB', path: '/o-cung-ssd?pa_dung-luong=120gb', url: '', parentId: '187926', cssClasses: [] },
                { id: 'd2', label: 'SSD 240GB', path: '/o-cung-ssd?pa_dung-luong=240gb', url: '', parentId: '187926', cssClasses: [] },
                { id: 'd3', label: 'SSD 250GB', path: '/o-cung-ssd?pa_dung-luong=250gb', url: '', parentId: '187926', cssClasses: [] },
                { id: 'd4', label: 'SSD 256GB', path: '/o-cung-ssd?pa_dung-luong=256gb', url: '', parentId: '187926', cssClasses: [] },
                { id: 'd5', label: 'SSD 500GB', path: '/o-cung-ssd?pa_dung-luong=500gb', url: '', parentId: '187926', cssClasses: [] },
                { id: 'd6', label: 'SSD 512GB', path: '/o-cung-ssd?pa_dung-luong=512gb', url: '', parentId: '187926', cssClasses: [] },
                { id: 'd7', label: 'SSD 960GB', path: '/o-cung-ssd?pa_dung-luong=960gb', url: '', parentId: '187926', cssClasses: [] },
                { id: 'd8', label: 'SSD 1TB', path: '/o-cung-ssd?pa_dung-luong=1tb', url: '', parentId: '187926', cssClasses: [] },
                { id: 'd9', label: 'SSD 2TB', path: '/o-cung-ssd?pa_dung-luong=2tb', url: '', parentId: '187926', cssClasses: [] },
                { id: 'd10', label: 'SSD 4TB', path: '/o-cung-ssd?pa_dung-luong=4tb', url: '', parentId: '187926', cssClasses: [] }
            ],
            [
                { id: 'p1', label: 'SSD dưới 1 triệu', path: '/o-cung-ssd?pa_khoang-gia-ssd=duoi-1-trieu', url: '', parentId: '187926', cssClasses: [] },
                { id: 'p2', label: 'SSD 1 triệu - 2 triệu', path: '/o-cung-ssd?pa_khoang-gia-ssd=1-trieu-2-trieu', url: '', parentId: '187926', cssClasses: [] },
                { id: 'p3', label: 'SSD 2 triệu - 3 triệu', path: '/o-cung-ssd?pa_khoang-gia-ssd=2-trieu-3-trieu', url: '', parentId: '187926', cssClasses: [] },
                { id: 'p4', label: 'SSD 3 triệu - 4 triệu', path: '/o-cung-ssd?pa_khoang-gia-ssd=3-trieu-4-trieu', url: '', parentId: '187926', cssClasses: [] },
                { id: 'p5', label: 'SSD trên 4 triệu', path: '/o-cung-ssd?pa_khoang-gia-ssd=tren-4-trieu', url: '', parentId: '187926', cssClasses: [] }
            ],
            [
                { id: 't1', label: 'SSD 2.5 inch SATA', path: '/o-cung-ssd?pa_loai-o-cung-ssd=2-5-inch-sata', url: '', parentId: '187926', cssClasses: [] },
                { id: 't2', label: 'SSD M.2 NVMe', path: '/o-cung-ssd?pa_loai-o-cung-ssd=m-2-nvme', url: '', parentId: '187926', cssClasses: [] },
                { id: 't3', label: 'SSD M.2 SATA', path: '/o-cung-ssd?pa_loai-o-cung-ssd=m-2-sata', url: '', parentId: '187926', cssClasses: [] }
            ]
        ]
    },
    {
        id: '148488',
        label: 'PSU',
        path: '/psu-nguon-may-tinh',
        url: 'https://maytinhlmc.vn/psu-nguon-may-tinh',
        parentId: null,
        cssClasses: ['mega-menu-item-148488'],
        image: 'https://maytinhlmc.vn/wp-content/uploads/Menu_PSU_bg.png',
        columns: [
            [
                { id: 'b1', label: 'NGUỒN ASUS', path: '/psu-nguon-may-tinh?pa_thuong-hieu=asus', url: '', parentId: '148488', cssClasses: [] },
                { id: 'b2', label: 'NGUỒN NZXT', path: '/psu-nguon-may-tinh?pa_thuong-hieu=nzxt', url: '', parentId: '148488', cssClasses: [] },
                { id: 'b3', label: 'NGUỒN SUPER FLOWER', path: '/psu-nguon-may-tinh?pa_thuong-hieu=super-flower', url: '', parentId: '148488', cssClasses: [] },
                { id: 'b4', label: 'NGUỒN THERMALTAKE', path: '/psu-nguon-may-tinh?pa_thuong-hieu=thermaltake', url: '', parentId: '148488', cssClasses: [] },
                { id: 'b5', label: 'NGUỒN ANTEC', path: '/psu-nguon-may-tinh?pa_thuong-hieu=antec', url: '', parentId: '148488', cssClasses: [] },
                { id: 'b6', label: 'NGUỒN ACER', path: '/psu-nguon-may-tinh?pa_thuong-hieu=acer', url: '', parentId: '148488', cssClasses: [] },
                { id: 'b7', label: 'NGUỒN CORSAIR', path: '/psu-nguon-may-tinh?pa_thuong-hieu=corsair', url: '', parentId: '148488', cssClasses: [] },
                { id: 'b8', label: 'NGUỒN HUNTKEY', path: '/psu-nguon-may-tinh?pa_thuong-hieu=huntkey', url: '', parentId: '148488', cssClasses: [] },
                { id: 'b9', label: 'NGUỒN COOLER MASTER', path: '/psu-nguon-may-tinh?pa_thuong-hieu=cooler-master', url: '', parentId: '148488', cssClasses: [] },
                { id: 'b10', label: 'NGUỒN GIGABYTE', path: '/psu-nguon-may-tinh?pa_thuong-hieu=gigabyte', url: '', parentId: '148488', cssClasses: [] },
                { id: 'b11', label: 'NGUỒN MSI', path: '/psu-nguon-may-tinh?pa_thuong-hieu=msi', url: '', parentId: '148488', cssClasses: [] },
                { id: 'b12', label: 'NGUỒN XIGMATEK', path: '/psu-nguon-may-tinh?pa_thuong-hieu=xigmatek', url: '', parentId: '148488', cssClasses: [] },
                { id: 'b13', label: 'NGUỒN DEEPCOOL', path: '/psu-nguon-may-tinh?pa_thuong-hieu=deepcool', url: '', parentId: '148488', cssClasses: [] }
            ],
            [
                { id: 'w1', label: 'NGUỒN 450W', path: '/psu-nguon-may-tinh?pa_cong-suat-nguon=450w', url: '', parentId: '148488', cssClasses: [] },
                { id: 'w2', label: 'NGUỒN 500W', path: '/psu-nguon-may-tinh?pa_cong-suat-nguon=500w', url: '', parentId: '148488', cssClasses: [] },
                { id: 'w3', label: 'NGUỒN 550W', path: '/psu-nguon-may-tinh?pa_cong-suat-nguon=550w', url: '', parentId: '148488', cssClasses: [] },
                { id: 'w4', label: 'NGUỒN 600W', path: '/psu-nguon-may-tinh?pa_cong-suat-nguon=600w', url: '', parentId: '148488', cssClasses: [] },
                { id: 'w5', label: 'NGUỒN 650W', path: '/psu-nguon-may-tinh?pa_cong-suat-nguon=650w', url: '', parentId: '148488', cssClasses: [] },
                { id: 'w6', label: 'NGUỒN 750W', path: '/psu-nguon-may-tinh?pa_cong-suat-nguon=750w', url: '', parentId: '148488', cssClasses: [] },
                { id: 'w7', label: 'NGUỒN 850W', path: '/psu-nguon-may-tinh?pa_cong-suat-nguon=850w', url: '', parentId: '148488', cssClasses: [] },
                { id: 'w8', label: 'NGUỒN 1000W', path: '/psu-nguon-may-tinh?pa_cong-suat-nguon=1000w', url: '', parentId: '148488', cssClasses: [] },
                { id: 'w9', label: 'NGUỒN TRÊN 1000W', path: '/psu-nguon-may-tinh?pa_cong-suat-nguon=tren-1000w', url: '', parentId: '148488', cssClasses: [] }
            ],
            [
                { id: 'st1', label: 'NGUỒN 80 PLUS SILVER', path: '/psu-nguon-may-tinh?pa_chuan-nguon=80-plus-silver', url: '', parentId: '148488', cssClasses: [] },
                { id: 'st2', label: 'NGUỒN 80 PLUS BRONZE', path: '/psu-nguon-may-tinh?pa_chuan-nguon=80-plus-bronze', url: '', parentId: '148488', cssClasses: [] },
                { id: 'st3', label: 'NGUỒN 80 PLUS GOLD', path: '/psu-nguon-may-tinh?pa_chuan-nguon=80-plus-gold', url: '', parentId: '148488', cssClasses: [] },
                { id: 'st4', label: 'NGUỒN 80 PLUS TITANIUM', path: '/psu-nguon-may-tinh?pa_chuan-nguon=80-plus-titanium', url: '', parentId: '148488', cssClasses: [] },
                { id: 'st5', label: 'NGUỒN 80 PLUS PLATINUM', path: '/psu-nguon-may-tinh?pa_chuan-nguon=80-plus-platinum', url: '', parentId: '148488', cssClasses: [] }
            ],
            [
                { id: 'pr1', label: 'DƯỚI 2 TRIỆU', path: '/psu-nguon-may-tinh?pa_khoang-gia-nguon=duoi-2-trieu', url: '', parentId: '148488', cssClasses: [] },
                { id: 'pr2', label: '2 TRIỆU - 4 TRIỆU', path: '/psu-nguon-may-tinh?pa_khoang-gia-nguon=2-trieu-4-trieu', url: '', parentId: '148488', cssClasses: [] },
                { id: 'pr3', label: '4 TRIỆU - 6 TRIỆU', path: '/psu-nguon-may-tinh?pa_khoang-gia-nguon=4-trieu-6-trieu', url: '', parentId: '148488', cssClasses: [] },
                { id: 'pr4', label: '6 TRIỆU - 8 TRIỆU', path: '/psu-nguon-may-tinh?pa_khoang-gia-nguon=6-trieu-8-trieu', url: '', parentId: '148488', cssClasses: [] },
                { id: 'pr5', label: 'TRÊN 8 TRIỆU', path: '/psu-nguon-may-tinh?pa_khoang-gia-nguon=tren-8-trieu', url: '', parentId: '148488', cssClasses: [] }
            ]
        ]
    },
    {
        id: '148489',
        label: 'Case',
        path: '/case-vo-may-tinh',
        url: 'https://maytinhlmc.vn/case-vo-may-tinh',
        parentId: null,
        cssClasses: ['mega-menu-item-148489'],
        image: 'https://maytinhlmc.vn/wp-content/uploads/Case_Menu.png',
        columns: [
            [
                { id: 'c1', label: 'CASE MSI', path: '/case-vo-may-tinh/?pa_thuong-hieu=msi', url: '', parentId: '148489', cssClasses: [] },
                { id: 'c2', label: 'CASE SAMA', path: '/case-vo-may-tinh/?pa_thuong-hieu=sama', url: '', parentId: '148489', cssClasses: [] },
                { id: 'c3', label: 'CASE Corsair', path: '/case-vo-may-tinh/?pa_thuong-hieu=corsair', url: '', parentId: '148489', cssClasses: [] },
                { id: 'c4', label: 'CASE NZXT', path: '/case-vo-may-tinh/?pa_thuong-hieu=nzxt', url: '', parentId: '148489', cssClasses: [] },
                { id: 'c5', label: 'CASE Lian Li', path: '/case-vo-may-tinh/?pa_thuong-hieu=lian-li', url: '', parentId: '148489', cssClasses: [] }
            ],
            [
                { id: 'c6', label: 'CASE ASUS', path: '/case-vo-may-tinh/?pa_thuong-hieu=asus', url: '', parentId: '148489', cssClasses: [] },
                { id: 'c7', label: 'CASE XIGMATEK', path: '/case-vo-may-tinh/?pa_thuong-hieu=xigmatek', url: '', parentId: '148489', cssClasses: [] },
                { id: 'c8', label: 'CASE MAGIC', path: '/case-vo-may-tinh/?pa_thuong-hieu=magic', url: '', parentId: '148489', cssClasses: [] },
                { id: 'c9', label: 'CASE EDRA', path: '/case-vo-may-tinh/?pa_thuong-hieu=edra', url: '', parentId: '148489', cssClasses: [] },
                { id: 'c10', label: 'CASE VITRA', path: '/case-vo-may-tinh/?pa_thuong-hieu=vitra', url: '', parentId: '148489', cssClasses: [] }
            ],
            [
                { id: 'c11', label: 'CASE Gigabyte', path: '/case-vo-may-tinh/?pa_thuong-hieu=gigabyte', url: '', parentId: '148489', cssClasses: [] },
                { id: 'c12', label: 'CASE MIK', path: '/case-vo-may-tinh/?pa_thuong-hieu=mik', url: '', parentId: '148489', cssClasses: [] },
                { id: 'c13', label: 'CASE DeepCool', path: '/case-vo-may-tinh/?pa_thuong-hieu=deepcool', url: '', parentId: '148489', cssClasses: [] },
                { id: 'c14', label: 'CASE Cooler Master', path: '/case-vo-may-tinh/?pa_thuong-hieu=cooler-master', url: '', parentId: '148489', cssClasses: [] },
                { id: 'c15', label: 'CASE MONTECH', path: '/case-vo-may-tinh/?pa_thuong-hieu=montech', url: '', parentId: '148489', cssClasses: [] }
            ],
            [
                { id: 'c16', label: 'CASE ANTEC', path: '/case-vo-may-tinh/?pa_thuong-hieu=antec', url: '', parentId: '148489', cssClasses: [] },
                { id: 'c17', label: 'CASE JONSBO', path: '/case-vo-may-tinh/?pa_thuong-hieu=jonsbo', url: '', parentId: '148489', cssClasses: [] },
                { id: 'c18', label: 'CASE Cougar', path: '/case-vo-may-tinh/?pa_thuong-hieu=cougar', url: '', parentId: '148489', cssClasses: [] },
                { id: 'c19', label: 'CASE HYTE', path: '/case-vo-may-tinh/?pa_thuong-hieu=hyte', url: '', parentId: '148489', cssClasses: [] }
            ]
        ]
    },
    {
        id: '148494',
        label: 'Màn hình',
        path: '/man-hinh-may-tinh',
        url: 'https://maytinhlmc.vn/man-hinh-may-tinh',
        parentId: null,
        cssClasses: ['mega-menu-item-148494'],
        image: 'https://maytinhlmc.vn/wp-content/uploads/Menu_manhinh_bg.png',
        columns: [
            [
                { id: 'm1', label: 'MÀN HÌNH MSI', path: '/man-hinh-may-tinh?pa_thuong-hieu=msi', url: '', parentId: '148494', cssClasses: [] },
                { id: 'm2', label: 'MÀN HÌNH LG', path: '/man-hinh-may-tinh?pa_thuong-hieu=lg', url: '', parentId: '148494', cssClasses: [] },
                { id: 'm3', label: 'MÀN HÌNH ASUS', path: '/man-hinh-may-tinh?pa_thuong-hieu=asus', url: '', parentId: '148494', cssClasses: [] },
                { id: 'm4', label: 'MÀN HÌNH GIGABYTE', path: '/man-hinh-may-tinh?pa_thuong-hieu=gigabyte', url: '', parentId: '148494', cssClasses: [] },
                { id: 'm5', label: 'MÀN HÌNH LENOVO', path: '/man-hinh-may-tinh?pa_thuong-hieu=lenovo', url: '', parentId: '148494', cssClasses: [] },
                { id: 'm6', label: 'MÀN HÌNH EDRA', path: '/man-hinh-may-tinh?pa_thuong-hieu=edra', url: '', parentId: '148494', cssClasses: [] },
                { id: 'm7', label: 'MÀN HÌNH VSP', path: '/man-hinh-may-tinh?pa_thuong-hieu=vsp', url: '', parentId: '148494', cssClasses: [] }
            ],
            [
                { id: 'm8', label: 'MÀN HÌNH DELL', path: '/man-hinh-may-tinh?pa_thuong-hieu=dell', url: '', parentId: '148494', cssClasses: [] },
                { id: 'm9', label: 'MÀN HÌNH ACER', path: '/man-hinh-may-tinh?pa_thuong-hieu=acer', url: '', parentId: '148494', cssClasses: [] },
                { id: 'm10', label: 'MÀN HÌNH SAMSUNG', path: '/man-hinh-may-tinh?pa_thuong-hieu=samsung', url: '', parentId: '148494', cssClasses: [] },
                { id: 'm11', label: 'MÀN HÌNH AOC', path: '/man-hinh-may-tinh?pa_thuong-hieu=aoc', url: '', parentId: '148494', cssClasses: [] },
                { id: 'm12', label: 'MÀN HÌNH BENQ', path: '/man-hinh-may-tinh?pa_thuong-hieu=benq', url: '', parentId: '148494', cssClasses: [] },
                { id: 'm13', label: 'MÀN HÌNH VIEWSONIC', path: '/man-hinh-may-tinh?pa_thuong-hieu=viewsonic', url: '', parentId: '148494', cssClasses: [] },
                { id: 'm14', label: 'MÀN HÌNH HKC', path: '/man-hinh-may-tinh?pa_thuong-hieu=hkc', url: '', parentId: '148494', cssClasses: [] }
            ],
            [
                { id: 'r1', label: 'Full HD (1920x1080)', path: '/man-hinh-may-tinh?pa_do-phan-giai-man-hinh=full-hd-1920x1080', url: '', parentId: '148494', cssClasses: [] },
                { id: 'r2', label: '2K QHD (2560x1440)', path: '/man-hinh-may-tinh?pa_do-phan-giai-man-hinh=2k-qhd-2560x1440', url: '', parentId: '148494', cssClasses: [] },
                { id: 'r3', label: 'WQHD (3440x1440)', path: '/man-hinh-may-tinh?pa_do-phan-giai-man-hinh=wqhd-3440x1440', url: '', parentId: '148494', cssClasses: [] },
                { id: 'r4', label: '4K (3840x2160)', path: '/man-hinh-may-tinh?pa_do-phan-giai-man-hinh=4k-3840x2160', url: '', parentId: '148494', cssClasses: [] },
                { id: 'r5', label: 'DualQHD (5120x1440)', path: '/man-hinh-may-tinh?pa_do-phan-giai-man-hinh=dualqhd-5120x1440', url: '', parentId: '148494', cssClasses: [] },
                { id: 'r6', label: '5K (5120x2880)', path: '/man-hinh-may-tinh?pa_do-phan-giai-man-hinh=5k-5120-x-2880', url: '', parentId: '148494', cssClasses: [] }
            ],
            [
                { id: 'kz1', label: '17 inch', path: '/man-hinh-may-tinh?pa_kich-thuoc-man-hinh=17-inch', url: '', parentId: '148494', cssClasses: [] },
                { id: 'kz2', label: '21.5 inch', path: '/man-hinh-may-tinh?pa_kich-thuoc-man-hinh=21-5-inch', url: '', parentId: '148494', cssClasses: [] },
                { id: 'kz3', label: '23.8 inch', path: '/man-hinh-may-tinh?pa_kich-thuoc-man-hinh=23-8-inch', url: '', parentId: '148494', cssClasses: [] },
                { id: 'kz4', label: '24 inch', path: '/man-hinh-may-tinh?pa_kich-thuoc-man-hinh=24-inch', url: '', parentId: '148494', cssClasses: [] },
                { id: 'kz5', label: '25 inch', path: '/man-hinh-may-tinh?pa_kich-thuoc-man-hinh=25-inch', url: '', parentId: '148494', cssClasses: [] },
                { id: 'kz6', label: '27 inch', path: '/man-hinh-may-tinh?pa_kich-thuoc-man-hinh=27-inch', url: '', parentId: '148494', cssClasses: [] },
                { id: 'kz7', label: '28 inch', path: '/man-hinh-may-tinh?pa_kich-thuoc-man-hinh=28-inch', url: '', parentId: '148494', cssClasses: [] },
                { id: 'kz8', label: '31.5 inch', path: '/man-hinh-may-tinh?pa_kich-thuoc-man-hinh=31-5-inch', url: '', parentId: '148494', cssClasses: [] },
                { id: 'kz9', label: '32 inch', path: '/man-hinh-may-tinh?pa_kich-thuoc-man-hinh=32-inch', url: '', parentId: '148494', cssClasses: [] },
                { id: 'kz10', label: '34 inch', path: '/man-hinh-may-tinh?pa_kich-thuoc-man-hinh=34-inch', url: '', parentId: '148494', cssClasses: [] }
            ]
        ]
    },
    {
        id: '190839',
        label: 'Tản Nhiệt',
        path: '/fan-led-tan-nhiet-may-tinh',
        url: 'https://maytinhlmc.vn/fan-led-tan-nhiet-may-tinh',
        parentId: null,
        cssClasses: ['mega-menu-item-190839'],
        children: []
    },
    {
        id: '187911',
        label: 'Phím Chuột',
        path: '/phim-chuot-ban-ghe-gear',
        url: 'https://maytinhlmc.vn/phim-chuot-ban-ghe-gear',
        parentId: null,
        cssClasses: ['mega-menu-item-187911'],
        children: []
    },
    {
        id: '187914',
        label: 'Tai Nghe',
        path: '/loa-tai-nghe-mic-webcam',
        url: 'https://maytinhlmc.vn/loa-tai-nghe-mic-webcam',
        parentId: null,
        cssClasses: ['mega-menu-item-187914'],
        children: []
    }
];
