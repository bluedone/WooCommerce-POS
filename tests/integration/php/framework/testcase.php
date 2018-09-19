<?php

/**
 * Extend PHPUnit_Framework_TestCase with helper methods
 */

namespace WC_POS\Framework;

use GuzzleHttp\Client;
use GuzzleHttp\Cookie\CookieJar;
use GuzzleHttp\HandlerStack;
use Psr\Http\Message\RequestInterface;

class TestCase extends \PHPUnit_Framework_TestCase {

  /**
   * global Guzzle instance
   */
  protected $client;

  /**
   *
   */
  public function setUp() {
    parent::setUp();

//    $this->login();

    $this->client = new Client([
      'base_uri' => str_replace('localhost', 'static', get_woocommerce_api_url( '' )),
      'proxy' => [
        'http'  => 'http://static:80', // Use this proxy with "http"
        'https' => 'https://static:443', // Use this proxy with "https",
//        'no' => ['.mit.edu', 'foo.com']    // Don't use a proxy with these
      ],
      'defaults' => [
        'exceptions' => false,
        'cookies' => true,
        'headers' => [
          'X-WC-POS' => '1'
        ]
      ]
    ]);
  }

  /**
   * Login through wp-login.php, sets cookie
   */
  protected function login(){

    $client = new Client([
      'base_url' => wp_login_url(),
      'defaults' => [
        'exceptions' => false,
        'cookies' => true
      ]
    ]);

    $client->post('', [
      'body' => [
        'log' => 'admin',
        'pwd' => 'password',
      ]
    ]);

  }

  /**
   * Logout
   */
  protected function logout(){
    $client = new Client([
      'base_url' => wp_logout_url(),
      'defaults' => [
        'exceptions' => false,
        'cookies' => true
      ]
    ]);

    $client->get('');
  }

  /**
   * @param int $length
   * @return string
   */
  protected function generate_random_string($length=10) {
    $string = '';
    $characters = "ABCDEFHJKLMNPRTVWXYZabcdefghijklmnopqrstuvwxyz";
    for ($p = 0; $p < $length; $p++) {
      $string .= $characters[mt_rand(0, strlen($characters)-1)];
    }
    return $string;
  }

  /**
   * @param int $id
   * @return mixed
   */
  protected function get_product( $id ){
    $response = $this->client->get( get_woocommerce_api_url( 'products/' . $id ) );
    $data = $response->json();
    return $data['product'];
  }

  /**
   * @return mixed
   */
  protected function get_random_product_id() {
    $response = $this->client->get( get_woocommerce_api_url( 'products/ids' ) );
    $data = $response->json();
    $key = array_rand( $data['products'] );
    return $data['products'][$key]['id'];
  }

  /**
   * @return mixed
   */
  protected function get_random_product() {
    $product_id = $this->get_random_product_id();
    return $this->get_product($product_id);
  }

  /**
   * @param $response
   */
  protected function print_response_body( $response ) {
    echo $response->getBody();
  }

  /**
   * @param $response
   */
  protected function parseBodyAsJSON( $response ) {
    return json_decode($response->getBody(), true);
  }

}
