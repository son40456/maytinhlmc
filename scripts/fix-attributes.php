<?php
// Tải môi trường WordPress
require_once('../wp-load.php');

$args = array(
    'post_type'      => 'product',
    'posts_per_page' => -1,
    'post_status'    => 'any',
    'fields'         => 'ids'
);
$product_ids = get_posts($args);

$fixed_count = 0;

foreach ($product_ids as $product_id) {
    $attributes = get_post_meta($product_id, '_product_attributes', true);
    if (!is_array($attributes)) continue;

    $needs_update = false;

    foreach ($attributes as $key => $attr) {
        // Kiểm tra xem đây có phải là Global Attribute bị lưu nhầm thành Local không
        if (strpos($attr['name'], 'pa_') === 0 && empty($attr['is_taxonomy'])) {
            
            // Xử lý value đang chứa ID (vd: "217 | 218" hoặc "217")
            $values = is_array($attr['value']) ? $attr['value'] : explode('|', $attr['value']);
            $term_ids = array();
            
            foreach ($values as $val) {
                $val = trim($val);
                if (empty($val)) continue;

                if (is_numeric($val)) {
                    $term_ids[] = intval($val);
                } else {
                    // Nếu nó là chuỗi tên (không phải ID), thử tìm ID theo tên
                    $term = get_term_by('name', $val, $attr['name']);
                    if ($term) {
                        $term_ids[] = (int) $term->term_id;
                    } else {
                        // Thử tìm theo slug
                        $term = get_term_by('slug', $val, $attr['name']);
                        if ($term) {
                            $term_ids[] = (int) $term->term_id;
                        }
                    }
                }
            }

            // Gán các term này cho sản phẩm trong bảng term_relationships
            if (!empty($term_ids)) {
                // Ensure the terms are linked
                wp_set_object_terms($product_id, $term_ids, $attr['name']);
            }

            // Sửa lại metadata để biến nó thành Global Attribute (is_taxonomy = 1)
            $attributes[$key]['is_taxonomy'] = 1;
            $attributes[$key]['value'] = ''; // Global attribute không lưu value trong post_meta
            
            $needs_update = true;
        }
    }

    if ($needs_update) {
        update_post_meta($product_id, '_product_attributes', $attributes);
        $fixed_count++;
    }
}

echo "Da sua xong attributes cho $fixed_count san pham.\n";
