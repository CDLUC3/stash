require 'uri'
require 'typesafe_enum'

module Stash
  module Sword
    class Packaging < TypesafeEnum::Base

      new :BINARY, URI('http://purl.org/net/sword/package/Binary') do
        def content_type
          @content_type ||= 'application/octet-stream'
        end
      end

      new :SIMPLE_ZIP, URI('http://purl.org/net/sword/package/SimpleZip') do
        def content_type
          @content_type ||= 'application/zip'
        end
      end
    end
  end
end
