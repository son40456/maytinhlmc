<?php
/**
 * Script đồng bộ tự động Logo Thương hiệu từ danh sách có sẵn.
 * Copy file này lên thư mục gốc của apiserver và chạy.
 */

require_once dirname(__FILE__) . '/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/media.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/image.php';

echo "<h1>Bắt đầu tải Logo thương hiệu...</h1>";

$brand_logos = [
    'asus' => 'https://maytinhlmc.vn/wp-content/uploads/logo-asus-1.png',
    'msi' => 'https://maytinhlmc.vn/wp-content/uploads/logo-msi.png',
    'gigabyte' => 'https://maytinhlmc.vn/wp-content/uploads/logo-gigabyte.png',
    'colorful' => 'https://maytinhlmc.vn/wp-content/uploads/logo-colorful.png',
    'asrock' => 'https://maytinhlmc.vn/wp-content/uploads/logo-asrock.png',
    'intel' => 'https://maytinhlmc.vn/wp-content/uploads/logo-intel-1.png',
    'amd' => 'https://maytinhlmc.vn/wp-content/uploads/logo-amd-1.png',
    'corsair' => 'https://maytinhlmc.vn/wp-content/uploads/logo-corsair.png',
    'kingston' => 'https://maytinhlmc.vn/wp-content/uploads/logo-kingston.png',
    'samsung' => 'https://maytinhlmc.vn/wp-content/uploads/logo-samsung.png',
];

if (function_exists('acf_add_local_field_group')) {
    acf_add_local_field_group(array(
        'key' => 'group_brand_logo',
        'title' => 'Ảnh thuộc tính',
        'fields' => array(
            array(
                'key' => 'field_brand_logo',
                'label' => 'Ảnh thuộc tính',
                'name' => 'logo',
                'type' => 'image',
                'return_format' => 'id',
            ),
        ),
        'location' => array(
            array(
                array(
                    'param' => 'taxonomy',
                    'operator' => '==',
                    'value' => 'pa_thuong-hieu',
                ),
            ),
        ),
        'show_in_graphql' => 1,
        'graphql_custom_name' => 'logo',
        'active' => true,
    ));
}

foreach ($brand_logos as $slug => $source_url) {
    $new_term = get_term_by('slug', $slug, 'pa_thuong-hieu');
    if (!$new_term) {
        echo "<p>⚠️ Bỏ qua '{$slug}': Chưa có thương hiệu này trên web mới.</p>";
        continue;
    }

    $term_id = $new_term->term_id;
    $existing_logo = get_term_meta($term_id, 'logo', true);
    if ($existing_logo) {
        echo "<p>✅ Đã có logo cho '{$slug}', bỏ qua.</p>";
        continue;
    }

    echo "<p>🔄 Đang tải logo cho '{$slug}' từ {$source_url}...</p>";
    
    // Bypass SSL if old site has SSL issues
    add_filter('https_ssl_verify', '__return_false');
    $attachment_id = media_sideload_image($source_url, 0, $slug . ' logo', 'id');
    remove_filter('https_ssl_verify', '__return_false');

    if (is_wp_error($attachment_id)) {
        echo "<p style='color:red;'>❌ Lỗi tải logo cho '{$slug}': " . $attachment_id->get_error_message() . "</p>";
    } else {
        update_term_meta($term_id, 'logo', $attachment_id);
        update_term_meta($term_id, '_logo', 'field_brand_logo');
        echo "<p style='color:green;'>✔️ Đã gán logo thành công cho '{$slug}'.</p>";
    }
}
echo "<h2>Hoàn tất!</h2>";
