<?php

class RESTAPITest extends PHPUnit_Framework_TestCase {

  protected $client;

  public function setUp() {
    $this->client = new GuzzleHttp\Client([
      'base_url' => get_woocommerce_api_url( '' ),
      'defaults' => ['exceptions' => false]
    ]);
  }

  public function test_get_valid_http_response() {
    $response = $this->client->get(get_site_url());
    $this->assertEquals(200, $response->getStatusCode());
  }

  public function test_get_valid_api_response() {
    $response = $this->client->get();
    $this->assertEquals(200, $response->getStatusCode());
    $data = $response->json();
    $this->assertArrayHasKey('store', $data);
  }

}