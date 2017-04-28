Dir.glob(File.expand_path('../indexer/*.rb', __FILE__)).sort.each(&method(:require))
