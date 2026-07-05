<?php
/**
 * Script đồng bộ tự động ACF field "Thông tin sản phẩm" (thongtinsanpham)
 * Bạn hãy copy file này lên thư mục gốc của apiserver (ngang hàng wp-config.php) và truy cập:
 * https://apiserver.maytinhlmc.vn/migrate-product-acf.php
 */

require_once dirname(__FILE__) . '/wp-load.php';

echo "<h1>Bắt đầu đồng bộ ACF Thông tin sản phẩm...</h1>";

// 1. Tự động đăng ký ACF Group để sửa lỗi Schema GraphQL
if (function_exists('acf_add_local_field_group')) {
    acf_add_local_field_group(array(
        'key' => 'group_thongtinsanpham',
        'title' => 'Thông tin sản phẩm',
        'fields' => array(
            array(
                'key' => 'field_chinhsachbaohanh',
                'label' => 'Chính sách bảo hành',
                'name' => 'chinh_sach_bao_hanh',
                'type' => 'text',
                'graphql_custom_name' => 'chinhSachBaoHanh',
            ),
        ),
        'location' => array(
            array(
                array(
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'product',
                ),
            ),
        ),
        'show_in_graphql' => 1,
        'graphql_custom_name' => 'thongtinsanpham',
        'active' => true,
    ));
    echo "<p>✅ Đã đăng ký cấu trúc ACF thongtinsanpham thành công cho GraphQL. Sẽ hiển thị bình thường trên trang PC Builder!</p>";
}

// 2. Fetch dữ liệu từ web cũ
$old_graphql_url = 'https://next.maytinhlmc.vn/graphql';

$has_more = true;
$after = null;
$total_migrated = 0;
$page = 1;

while ($has_more) {
    echo "<p>Đang tải trang dữ liệu thứ $page từ web cũ...</p>";
    $query = '
    query GetOldProducts($after: String) {
      products(first: 100, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          slug
          ... on SimpleProduct {
            thongtinsanpham {
              chinhSachBaoHanh
            }
          }
          ... on VariableProduct {
            thongtinsanpham {
              chinhSachBaoHanh
            }
          }
        }
      }
    }
    ';

    $variables = ['after' => $after];

    $response = wp_remote_post($old_graphql_url, [
        'headers' => ['Content-Type' => 'application/json'],
        'body'    => wp_json_encode(['query' => $query, 'variables' => $variables]),
        'timeout' => 60
    ]);

    if (is_wp_error($response)) {
        die("❌ Lỗi kết nối đến web cũ: " . $response->get_error_message());
    }

    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);

    if (isset($data['errors'])) {
        die("❌ Lỗi truy vấn GraphQL: " . print_r($data['errors'], true));
    }

    $products = $data['data']['products']['nodes'] ?? [];
    $pageInfo = $data['data']['products']['pageInfo'] ?? [];
    
    foreach ($products as $p) {
        $slug = $p['slug'];
        $chinhSach = $p['thongtinsanpham']['chinhSachBaoHanh'] ?? null;
        
        if (empty($chinhSach)) continue;

        // Tìm product trên web mới theo slug
        $args = array(
            'name'        => $slug,
            'post_type'   => 'product',
            'post_status' => 'any',
            'numberposts' => 1
        );
        $new_posts = get_posts($args);
        
        if (!empty($new_posts)) {
            $post_id = $new_posts[0]->ID;
            
            // Lấy giá trị hiện tại để tránh ghi đè nếu đã có
            $existing = get_post_meta($post_id, 'chinh_sach_bao_hanh', true);
            if (!$existing) {
                update_post_meta($post_id, 'chinh_sach_bao_hanh', $chinhSach);
                update_post_meta($post_id, '_chinh_sach_bao_hanh', 'field_chinhsachbaohanh');
                echo "<div style='color:green;font-size:12px;'>✔️ Cập nhật bảo hành cho: {$slug} -> {$chinhSach}</div>";
                $total_migrated++;
            }
        }
    }

    $has_more = $pageInfo['hasNextPage'] ?? false;
    $after = $pageInfo['endCursor'] ?? null;
    $page++;
}

echo "<h2>Đồng bộ hoàn tất! Đã cập nhật $total_migrated sản phẩm.</h2>";
