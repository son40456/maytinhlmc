<?php
require_once dirname(__FILE__) . '/wp-load.php';

$old_graphql_url = 'https://next.maytinhlmc.vn/graphql';
$query = '
query GetOldLogos {
  terms(where: {taxonomies: PA_THUONGHIEU}, first: 100) {
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

echo wp_remote_retrieve_body($response);
