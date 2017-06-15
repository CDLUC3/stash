require 'httpclient'
require 'net/http'

module StashEngine
  class UrlValidator # rubocop:disable Metrics/ClassLength

    attr_reader :mime_type, :size, :url, :status_code, :redirected_to, :filename

    def initialize(url:)
      @url = url
      @mime_type = ''
      @size = 0
      @status_code = nil
      @timed_out = nil
      @redirected = nil
      @redirected_to = nil
    end

    # this method does the magic and checks the URL
    def validate # rubocop:disable Metrics/MethodLength
      unless correctly_formatted_url?
        @status_code = 400 # bad request because the URL is malformed
        return false
      end

      client = setup_httpclient
      @tries = 3
      begin
        @tries -= 1
        @timed_out = false
        response = client.head(@url, follow_redirect: true)
        init_from(response)
        # the follow is for google drive which doesn't respond to head requests correctly
        fix_by_get_request(redirected_to || url) if status_code == 503
        return true
      rescue HTTPClient::TimeoutError
        @timed_out = true
        @status_code = 408
      rescue SocketError, HTTPClient::KeepAliveDisconnected, HTTPClient::BadResponseError, ArgumentError, Errno::ECONNREFUSED
        # Socketerror seems to mean a domain that is down or unavailable, tried http://macgyver.com
        # https://carpark.com seems to timeout
        # http://poodle.com -- keep alive disconnected
        retry if @tries > 0
        @status_code = 499
      end
      false
    end

    def timed_out?
      @timed_out
    end

    def redirected?
      @redirected
    end

    def correctly_formatted_url?
      u = URI.parse(@url)
      u.is_a?(URI::HTTP)
    rescue URI::InvalidURIError
      false
    end

    # the content disposition filename is ugly and there are some variations for ascii vs other encodings such
    # as utf8 and percent encoding of content
    def filename_from_content_disposition(disposition)
      disposition = disposition.first if disposition.class == Array
      return nil if disposition.blank?
      if (match = disposition.match(/filename=([^;$]+)/)) # simple filenames
        extract_and_unquote(match)
      elsif (match = disposition.match(/filename\*=\S+'\S*'([^;$]+)/)) # rfc5646 shenanigans
        my_match = extract_and_unquote(match)
        CGI.unescape(my_match)
      end
    end

    private

    def setup_httpclient
      clnt = HTTPClient.new

      # this callback allows following redirects from http to https or opposite, otherwise it will not follow them
      clnt.redirect_uri_callback = ->(_uri, res) { res.header['location'][0] }
      clnt.connect_timeout = 5
      clnt.send_timeout = 5
      clnt.receive_timeout = 5
      clnt.keep_alive_timeout = 5
      clnt.ssl_config.verify_mode = OpenSSL::SSL::VERIFY_NONE
      # clnt.send_timeout = 15
      # clnt.receive_timeout = 15
      clnt
    end

    def init_from(response)
      @status_code = response.status_code
      @mime_type = mime_type_from(response)
      @size = size_from(response)
      @redirected = !response.previous.nil?
      @redirected_to = response.previous.header['Location'].first if @redirected
      @filename = filename_from(response, @redirected_to, @url)
    end

    def size_from(response)
      content_length = response.header['Content-Length']
      content_length = content_length.first if content_length.class == Array && !content_length.blank?
      content_length.to_i unless content_length.blank?
    end

    def mime_type_from(response)
      content_type = response.header['Content-Type']
      return if content_type.blank?
      mime_type = (content_type.class == Array ? content_type.first : content_type)
      return mime_type unless mime_type =~ /^\S*;/ # mimetype and not charset stuff after ';'
      mime_type[/^\S*;/][0..-2]
    end

    # get the filename from either the 1) content disposition, 2) redirected url (if avail) or 3) url
    def filename_from(response, redirected_to, url)
      filename = filename_from_content_disposition(response.header['Content-Disposition']) ||
        filename_from_url(redirected_to) || filename_from_url(url)
      return filename unless ['', '/'].include?(filename)
      last_resort_filename
    end

    def filename_from_url(url)
      return nil if url.blank?
      u = URI.parse(url)
      File.basename(u.path)
    end

    # generate a filename as a last resort
    def last_resort_filename
      URI.parse(@url).host if correctly_formatted_url?
    end

    def extract_and_unquote(match)
      my_match = match[1].strip
      return my_match unless my_match[0] == my_match[-1] && "\"'".include?(my_match[0])
      my_match[1..-2]
    end

    def fix_by_get_request(u)
      # supposed to work, but returns connection reset by peer always
      #url = URI.parse(u)
      #http = Net::HTTP.new(url.host, url.port)
      #http.read_timeout = 5
      #http.open_timeout = 5
      #http.start() {|http| http.get(url.path) }

      url = URI.parse(u)
      resp = Net::HTTP.get_response(url)

      if resp.code == '200'
        h = resp.to_hash
        @status_code = 200
        @mime_type = mime_type_from(resp)
        @size = size_from(resp)
        @filename = filename_from(resp, u, u)
      end
    end
  end
end
