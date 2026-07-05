<?php
/**
 * Script đồng bộ tự động Logo Thương hiệu từ web cũ sang web mới.
 * Bạn hãy copy file này lên thư mục gốc của apiserver (ngang hàng wp-config.php) và truy cập qua trình duyệt:
 * https://apiserver.maytinhlmc.vn/migrate-brand-logos.php
 */

require_once dirname(__FILE__) . '/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/media.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/image.php';

echo "<h1>Bắt đầu đồng bộ Logo thương hiệu...</h1>";

$old_graphql_url = 'https://next.maytinhlmc.vn/graphql';
$query = '
query GetOldLogos {
  terms(where: {taxonomies: PATHUONGHIEU}, first: 100) {
    nodes {
      slug
      name
      ... on PaThuongHieu {
        logo {
          logo {
            node {
              sourceUrl
            }
          }
        }
      }
    }
  }
}
';

$response = wp_remote_post($old_graphql_url, [
    'headers' => ['Content-Type' => 'application/json'],
    'body'    => wp_json_encode(['query' => $query]),
    'timeout' => 30
]);

if (is_wp_error($response)) {
    die("Lỗi kết nối đến web cũ: " . $response->get_error_message());
}

$body = wp_remote_retrieve_body($response);
$data = json_decode($body, true);

if (empty($data['data']['terms']['nodes'])) {
    die("Không tìm thấy thương hiệu nào ở web cũ. Raw Response: " . print_r($data, true));
}

$old_terms = $data['data']['terms']['nodes'];

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
                'preview_size' => 'medium',
                'library' => 'all',
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

foreach ($old_terms as $old_term) {
    $slug = $old_term['slug'];
    $source_url = $old_term['logo']['logo']['node']['sourceUrl'] ?? '';

    if (empty($source_url)) {
        continue; // Bỏ qua nếu hãng này ở web cũ chưa có logo
    }

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
    
    add_filter('https_ssl_verify', '__return_false');
    $attachment_id = media_sideload_image($source_url, 0, $slug . ' logo', 'id');
    remove_filter('https_ssl_verify', '__return_false');

    if (is_wp_error($attachment_id)) {
        echo "<p style='color:red;'>❌ Lỗi tải logo cho '{$slug}': " . $attachment_id->get_error_message() . "</p>";
    } else {
        update_term_meta($term_id, 'logo', $attachment_id);
        update_term_meta($term_id, '_logo', 'field_brand_logo'); // Khóa tham chiếu của ACF
        echo "<p style='color:green;'>✔️ Đã gán logo thành công cho '{$slug}'.</p>";
    }
}

echo "<h2>Đồng bộ hoàn tất!</h2>";
